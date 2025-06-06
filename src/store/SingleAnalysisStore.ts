import {computed, markRaw, ref, shallowRef, toRaw, watch} from "vue";
import {defineStore} from "pinia";
import usePept2filtered from "@/composables/communication/unipept/usePept2filtered";
import usePeptideProcessor from "@/composables/processing/peptide/usePeptideProcessor";
import usePeptideTrustProcessor from "@/composables/processing/peptide/usePeptideTrustProcessor";
import useEcProcessor from "@/composables/processing/functional/useEcProcessor";
import useGoProcessor from "@/composables/processing/functional/useGoProcessor";
import useInterproProcessor from "@/composables/processing/functional/useInterproProcessor";
import useOntologyStore from "@/store/OntologyStore";
import useTaxonomicProcessor from "@/composables/processing/taxonomic/useTaxonomicProcessor";
import useNcbiTreeProcessor from "@/composables/processing/taxonomic/useNcbiTreeProcessor";
import usePeptonizerStore, {PeptonizerStoreImport} from "@/store/PeptonizerAnalysisStore";
import {AnalysisStatus} from "@/store/AnalysisStatus";
import {AnalysisConfig} from "@/store/AnalysisConfig";
import useCustomFilterStore from "@/store/CustomFilterStore";
import useMetaData from "@/composables/communication/unipept/useMetaData";
import {ShareableMap, TransferableState} from "shared-memory-datastructures";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";

const useSingleAnalysisStore = (
    _id: string,
    _name: string,
    _rawPeptides: string,
    _config: AnalysisConfig,
    // Intensity values that can be used by the Peptonizer to improve accuracy of the analysis
    _peptideIntensities?: Map<string, number>
) => defineStore(`singleAnalysisStore/${_id}`, () => {
    const ontologyStore = useOntologyStore();
    const customFilterStore = useCustomFilterStore();
    const peptonizerStore = usePeptonizerStore(_id);

    // ===============================================================
    // ======================== REFERENCES ===========================
    // ===============================================================

    const status = ref<AnalysisStatus>(AnalysisStatus.Pending);
    const filteringStatus = ref<AnalysisStatus>(AnalysisStatus.Finished);
    const lastAnalysed = ref<Date | undefined>(undefined);
    const analysisError = ref<string>("");

    const id = ref<string>(_id);
    const name = ref<string>(_name);
    const rawPeptides = shallowRef<string>(_rawPeptides);
    const config = ref<AnalysisConfig>({ ..._config });
    const intensities = shallowRef<Map<string, number> | undefined>(_peptideIntensities);

    const taxonomicFilter = ref<number>(1);
    const functionalFilter = ref<number>(5);

    // ===============================================================
    // ======================== PROCESSORS ===========================
    // ===============================================================
    const { peptideData: peptideToData, process: processPept2Filtered } = usePept2filtered();

    const { databaseVersion, process: processMetadata } = useMetaData();
    const { countTable: peptidesTable, process: processPeptides } = usePeptideProcessor();
    const { countTable: filteredPeptidesTable, process: processFilteredPeptides } = usePeptideProcessor();
    const { trust: peptideTrust, process: processPeptideTrust } = usePeptideTrustProcessor();
    const { countTable: ecTable, trust: ecTrust, ecToPeptides, process: processEc } = useEcProcessor();
    const { countTable: goTable, trust: goTrust, goToPeptides, process: processGo } = useGoProcessor();
    const { countTable: iprTable, trust: iprTrust, iprToPeptides, process: processInterpro } = useInterproProcessor();
    const { countTable: lcaTable, lcaToPeptides, peptideToLca, process: processLca } = useTaxonomicProcessor();
    const { root: ncbiTree, nodes: ncbiTreeNodes, process: processNcbiTree } = useNcbiTreeProcessor();

    // ===============================================================
    // ========================= COMPUTED ============================
    // ===============================================================

    const peptides = computed(() =>
        rawPeptides.value.split("\n").map(p => p.trim()).filter(p => p.length > 0)
    );

    const filteredOrganism = computed(() => ncbiTreeNodes.value.get(taxonomicFilter.value));

    const lastAnalysedString = computed(() => {
        if (!lastAnalysed.value) return "";

        const formatter = new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric"
        })

        return formatter.format(lastAnalysed.value);
    });

    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const analyse = async (fetch: boolean = true) => {
        status.value = AnalysisStatus.Running;

        try {
            await processPeptides(peptides.value!, config.value.equate, config.value.filter);

            if (fetch) {
                const filter = customFilterStore.getFilter(config.value.database);
                await processPept2Filtered([...peptidesTable.value!.counts.keys()], config.value.equate, filter);

                await processMetadata();
                lastAnalysed.value = new Date();
            }

            processPeptideTrust(peptidesTable!.value!, peptideToData.value!);

            await processLca(peptidesTable.value!, peptideToData.value!);
            await processEc(peptidesTable!.value!, peptideToData.value!, functionalFilter.value!);
            await processGo(peptidesTable!.value!, peptideToData.value!, functionalFilter.value!);
            await processInterpro(peptidesTable.value!, peptideToData.value!, functionalFilter.value!);

            await ontologyStore.updateEcOntology(Array.from(ecToPeptides.value!.keys()));
            await ontologyStore.updateGoOntology(Array.from(goToPeptides.value!.keys()));
            await ontologyStore.updateIprOntology(Array.from(iprToPeptides.value!.keys()));
            await ontologyStore.updateNcbiOntology(Array.from(lcaTable.value!.counts.keys()));

            processNcbiTree(lcaTable.value!);

            status.value = AnalysisStatus.Finished;
        } catch (error) {
            status.value = AnalysisStatus.Failed;
            if (error) {
                analysisError.value = (error as any).toString();
            } else {
                analysisError.value = "Unknown error";
            }
        }
    }

    const updateFunctionalFilter = async (newFilter: number) => {
        filteringStatus.value = AnalysisStatus.Running;

        functionalFilter.value = newFilter;

        const table = filteredPeptidesTable.value || peptidesTable.value;
        await processEc(table!, peptideToData.value!, functionalFilter.value!);
        await processGo(table!, peptideToData.value!, functionalFilter.value!);
        await processInterpro(table!, peptideToData.value!, functionalFilter.value!);

        filteringStatus.value = AnalysisStatus.Finished;
    }

    const updateTaxonomicFilter = async (newFilter: number) => {
        filteringStatus.value = AnalysisStatus.Running;

        const getOwnAndChildrenSequences = async (
            taxonId: number
        ): Promise<string[]> => {
            const sequences: string[] = [];
            const nodes = [ ncbiTreeNodes.value.get(taxonId)! ];

            while (nodes.length > 0) {
                const node = nodes.pop();
                if (node && lcaToPeptides.value!.has(node.id)) {
                    sequences.push(...lcaToPeptides.value!.get(node?.id)!);
                }

                if (node?.children) {
                    nodes.push(...node.children);
                }
            }

            return sequences;
        }

        taxonomicFilter.value = newFilter;

        const filteredPeptides = await getOwnAndChildrenSequences(taxonomicFilter.value!);

        await processFilteredPeptides(filteredPeptides, config.value.equate, config.value.filter);

        await processEc(filteredPeptidesTable.value!, peptideToData.value!, functionalFilter.value!);
        await processGo(filteredPeptidesTable.value!, peptideToData.value!, functionalFilter.value!);
        await processInterpro(filteredPeptidesTable.value!, peptideToData.value!, functionalFilter.value!);

        filteringStatus.value = AnalysisStatus.Finished;
    }

    const updateName = (newName: string) => {
        name.value = newName;
    }

    const updateConfig = (newConfig: AnalysisConfig) => {
        config.value = { ...newConfig };
        status.value = AnalysisStatus.Pending;
    }

    const exportStore = (): SingleAnalysisStoreImport => {
        const peptideToDataTransferable = peptideToData.value?.toTransferableState();

        const intensitiesObject: any = {};
        if (intensities.value) {
            for (const [key, value] of intensities.value) {
                intensitiesObject[key] = value;
            }
        }
        let intensitiesString: string = JSON.stringify(intensitiesObject);

        return {
            id: id.value,
            name: name.value,
            rawPeptides: rawPeptides.value,
            config: { ...config.value },
            intensities: intensitiesString,
            taxonomicFilter: taxonomicFilter.value,
            functionalFilter: functionalFilter.value,
            lastAnalysed: lastAnalysed.value,
            databaseVersion: databaseVersion.value,

            peptideToDataTransferable,

            peptonizer: peptonizerStore.exportStore()
        }
    }

    const importStore = async () => {
        await analyse(peptideToData.value === undefined);
        await updateTaxonomicFilter(taxonomicFilter.value);
    }

    const setImportedData = (storeImport: SingleAnalysisStoreImport) => {
        status.value = AnalysisStatus.Pending;

        taxonomicFilter.value = storeImport.taxonomicFilter;
        functionalFilter.value = storeImport.functionalFilter;
        lastAnalysed.value = storeImport.lastAnalysed ? new Date(storeImport.lastAnalysed) : undefined;
        databaseVersion.value = storeImport.databaseVersion;

        if (storeImport.peptideToDataTransferable) {
            peptideToData.value = markRaw(ShareableMap.fromTransferableState<string, PeptideData>(storeImport.peptideToDataTransferable, { serializer: new PeptideDataSerializer() }));
        }

        if (storeImport.peptonizer) {
            peptonizerStore.setImportedData(storeImport.peptonizer);
        }
    }

    return {
        id,
        name,
        rawPeptides,
        peptides,
        config,
        intensities,
        taxonomicFilter,
        filteredOrganism,
        functionalFilter,
        status,
        filteringStatus,
        databaseVersion,
        lastAnalysedString,
        analysisError,

        peptideToData,
        peptidesTable,
        peptideTrust,
        ecTable,
        ecTrust,
        ecToPeptides,
        goTable,
        goTrust,
        goToPeptides,
        iprTable,
        iprTrust,
        iprToPeptides,
        lcaTable,
        lcaToPeptides,
        peptideToLca,
        ncbiTree,

        ontologyStore,

        peptonizerStore,

        analyse,
        updateName,
        updateConfig,
        updateFunctionalFilter,
        updateTaxonomicFilter,
        exportStore,
        importStore,
        setImportedData
    };
})();

export interface SingleAnalysisStoreImport {
    id: string;
    name: string;
    rawPeptides: string;
    config: AnalysisConfig;
    // JSON-serialized version of the intensities map
    intensities: string | undefined;
    taxonomicFilter: number;
    functionalFilter: number;
    lastAnalysed: Date | undefined;
    databaseVersion: string;
    peptideToDataTransferable: TransferableState | undefined;
    peptonizer: PeptonizerStoreImport | undefined;
}

export const useSingleAnalysisStoreImport = (storeImport: SingleAnalysisStoreImport) => {
    let intensitiesMap: Map<string, number> | undefined;
    if (storeImport.intensities && storeImport.intensities !== "{}") {
        intensitiesMap = new Map<string, number>();
        for (const [key, value] of Object.entries(JSON.parse(storeImport.intensities))) {
            intensitiesMap.set(key, value as number);
        }
    }

    const store = useSingleAnalysisStore(
        storeImport.id,
        storeImport.name,
        storeImport.rawPeptides,
        storeImport.config,
        storeImport.intensities === undefined ? undefined : intensitiesMap
    );

    store.setImportedData(storeImport);

    return store;
}

export type SingleAnalysisStore = ReturnType<typeof useSingleAnalysisStore>;

export default useSingleAnalysisStore;

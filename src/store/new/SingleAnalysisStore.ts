import {computed, ref, shallowRef} from "vue";
import {defineStore} from "pinia";
import usePept2filtered from "@/composables/new/communication/unipept/usePept2filtered";
import usePeptideProcessor from "@/composables/new/processing/peptide/usePeptideProcessor";
import usePeptideTrustProcessor from "@/composables/new/processing/peptide/usePeptideTrustProcessor";
import useEcProcessor from "@/composables/new/processing/functional/useEcProcessor";
import useGoProcessor from "@/composables/new/processing/functional/useGoProcessor";
import useInterproProcessor from "@/composables/new/processing/functional/useInterproProcessor";
import useOntologyStore from "@/store/new/OntologyStore";
import useTaxonomicProcessor from "@/composables/new/processing/taxonomic/useTaxonomicProcessor";
import useNcbiTreeProcessor from "@/composables/new/processing/taxonomic/useNcbiTreeProcessor";
import usePeptonizerStore from "@/store/new/PeptonizerAnalysisStore";

export enum AnalysisStatus {
    Pending,
    Running,
    Finished
}

export interface AnalysisConfig {
    equate: boolean;
    filter: boolean;
    missed: boolean;
    database: string;
}

const useSingleAnalysisStore = (
    _id: string,
    _name: string,
    _rawPeptides: string,
    _config: AnalysisConfig,
    // Intensity values that can be used by the Peptonizer to improve accuracy of the analysis
    _peptideIntensities?: Map<string, number>
) => defineStore(`singleSampleStore/${_id}`, () => {
    const ontologyStore = useOntologyStore();

    // ===============================================================
    // ======================== REFERENCES ===========================
    // ===============================================================

    const status = ref<AnalysisStatus>(AnalysisStatus.Pending);
    const filteringStatus = ref<AnalysisStatus>(AnalysisStatus.Finished);

    const id = ref<string>(_id);
    const name = ref<string>(_name);
    const rawPeptides = ref<string>(_rawPeptides);
    const config = ref<AnalysisConfig>({ ..._config });
    const intensities = ref<Map<string, number> | undefined>(_peptideIntensities);

    const taxonomicFilter = ref<number>(1);
    const functionalFilter = ref<number>(5);

    // ===============================================================
    // ======================== PROCESSORS ===========================
    // ===============================================================

    const { peptideData: peptideToData, process: processPept2Filtered } = usePept2filtered();

    const { countTable: peptidesTable, process: processPeptides } = usePeptideProcessor();
    const { trust: peptideTrust, process: processPeptideTrust } = usePeptideTrustProcessor();
    const { countTable: ecTable, trust: ecTrust, ecToPeptides, process: processEc } = useEcProcessor();
    const { countTable: goTable, trust: goTrust, goToPeptides, process: processGo } = useGoProcessor();
    const { countTable: iprTable, trust: iprTrust, iprToPeptides, process: processInterpro } = useInterproProcessor();
    const { countTable: lcaTable, lcaToPeptides, peptideToLca, process: processLca } = useTaxonomicProcessor();
    const { root: ncbiTree, process: processNcbiTree } = useNcbiTreeProcessor();
    const peptonizerStore = usePeptonizerStore(_id);

    // ===============================================================
    // ========================= COMPUTED ============================
    // ===============================================================

    const peptides = computed(() =>
        rawPeptides.value.split("\n").map(p => p.trim()).filter(p => p.length > 0)
    );

    // ===============================================================
    // ========================== METHODS ============================
    // ===============================================================

    const analyse = async () => {
        status.value = AnalysisStatus.Running;

        await processPeptides(peptides.value!, config.value.equate, config.value.filter);

        await processPept2Filtered([...peptidesTable.value!.keys()], config.value.equate);
        processPeptideTrust(peptidesTable!.value!, peptideToData.value!);

        await processLca(peptidesTable.value!, peptideToData.value!);
        await processEc(peptidesTable!.value!, peptideToData.value!, functionalFilter.value!);
        await processGo(peptidesTable!.value!, peptideToData.value!, functionalFilter.value!);
        await processInterpro(peptidesTable.value!, peptideToData.value!, functionalFilter.value!);


        await ontologyStore.updateEcOntology(Array.from(ecToPeptides.value!.keys()));
        await ontologyStore.updateGoOntology(Array.from(goToPeptides.value!.keys()));
        await ontologyStore.updateIprOntology(Array.from(iprToPeptides.value!.keys()));
        await ontologyStore.updateNcbiOntology(Array.from(lcaTable.value!.keys()));

        // TODO: remove
        //await new Promise(resolve => setTimeout(resolve, 10000));

        processNcbiTree(lcaTable.value!, lcaToPeptides.value!);

        status.value = AnalysisStatus.Finished
    }

    const updateFilter = async (newFilter: number) => {
        filteringStatus.value = AnalysisStatus.Running;

        functionalFilter.value = newFilter;

        await processEc(peptidesTable.value!, peptideToData.value!, newFilter);
        await processGo(peptidesTable.value!, peptideToData.value!, newFilter);
        await processInterpro(peptidesTable.value!, peptideToData.value!, newFilter);

        filteringStatus.value = AnalysisStatus.Finished;
    }

    const updateName = (newName: string) => {
        name.value = newName;
    }

    const updateConfig = (newConfig: AnalysisConfig) => {
        config.value = { ...newConfig };
        status.value = AnalysisStatus.Pending;
    }

    return {
        id,
        name,
        rawPeptides,
        peptides,
        config,
        intensities,
        functionalFilter,
        status,
        filteringStatus,

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

        peptonizerStore,

        analyse,
        updateName,
        updateConfig,
        updateFilter
    };
})();

export type SingleAnalysisStore = ReturnType<typeof useSingleAnalysisStore>;

export default useSingleAnalysisStore;

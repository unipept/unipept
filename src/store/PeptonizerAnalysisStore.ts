import {ref, toRaw} from "vue";
import {defineStore} from "pinia";
import CountTable from "@/logic/processors/CountTable";
import {NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
import PeptonizerProcessor from "@/logic/processors/peptonizer/PeptonizerProcessor";
import useOntologyStore from "@/store/OntologyStore";
import {ShareableMap} from "shared-memory-datastructures";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import usePeptonizerAnalysisProgress from "@/store/usePeptonizerAnalysisProgress";

export enum PeptonizerStatus {
    Pending,
    Running,
    Finished,
    Failed
}

const usePeptonizerStore = (sampleId: string) => defineStore(`peptonizerStore_${sampleId}`, () => {
    const status = ref<PeptonizerStatus>(PeptonizerStatus.Pending);
    const taxaIdsToConfidence = ref<Map<number, number> | undefined>();
    const taxaNamesToConfidence = ref<Map<string, number> | undefined>();

    const {
        currentProgress,
        etaSeconds,
        started: peptonizerStarted,
        initializationFinished: peptonizerInitalizationFinished,
        finished: peptonizerFinished,
        createListener
    } = usePeptonizerAnalysisProgress();
    const peptonizerError = ref<string>("");

    let peptonizerProcessor: PeptonizerProcessor | undefined;

    const runPeptonizer = async (
        peptideCountTable: CountTable<string>,
        peptideToData: ShareableMap<string, PeptideData>,
        rank: NcbiRank,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        status.value = PeptonizerStatus.Running;

        // Reset to initial values
        taxaIdsToConfidence.value = undefined;
        taxaNamesToConfidence.value = undefined;
        peptonizerError.value = "";

        const listener = createListener();

        try {
            const peptideTaxa = new Map<string, number[]>();

            for (const peptide of peptideCountTable.counts.keys()) {
                if (peptideToData.get(peptide)) {
                    peptideTaxa.set(peptide, peptideToData.get(peptide)!.taxa);
                }
            }

            peptonizerProcessor = new PeptonizerProcessor();
            const peptonizerData = await peptonizerProcessor.runPeptonizer(
                peptideTaxa,
                peptideCountTable,
                rank,
                listener,
                equateIl,
                peptideIntensities
            );

            // No data is returned by the peptonizer if it's execution has been cancelled by the user
            if (!peptonizerData) {
                status.value = PeptonizerStatus.Pending;
                return;
            }

            taxaIdsToConfidence.value = new Map<number, number>(Array.from(peptonizerData.entries()).map(([k, v]) => [Number.parseInt(k), v]));

            // Convert the labels from taxon IDs to taxon names
            const {updateNcbiOntology, getNcbiDefinition} = useOntologyStore();
            await updateNcbiOntology(Array.from(taxaIdsToConfidence.value.keys()), false);

            taxaNamesToConfidence.value = new Map(Array.from(taxaIdsToConfidence.value.entries()).map(([k, v]) => [getNcbiDefinition(k)!.name, v]));

            status.value = PeptonizerStatus.Finished;
        } catch (error) {
            status.value = PeptonizerStatus.Failed;
            peptonizerError.value = (error as any).toString();
        }
    }

    const cancelPeptonizer = () => {
        if (peptonizerProcessor) {
            peptonizerProcessor.cancelPeptonizer();
        }
        status.value = PeptonizerStatus.Pending;
    }

    const exportStore = (): PeptonizerStoreImport | undefined => {
        if (taxaIdsToConfidence.value && taxaNamesToConfidence.value) {
            return {
                taxaIdsToConfidence: Array.from(toRaw(taxaIdsToConfidence.value).entries()),
                taxaNamesToConfidence: Array.from(toRaw(taxaNamesToConfidence.value).entries()),
                status: status.value
            }
        }

        return undefined;
    }

    const setImportedData = (storeImport: PeptonizerStoreImport) => {
        taxaIdsToConfidence.value = new Map<number, number>(storeImport.taxaIdsToConfidence);
        taxaNamesToConfidence.value = new Map<string, number>(storeImport.taxaNamesToConfidence);
        status.value = PeptonizerStatus.Finished;
    }

    return {
        taxaNamesToConfidence,
        taxaIdsToConfidence,

        status,
        currentProgress,
        etaSeconds,
        peptonizerStarted,
        peptonizerInitalizationFinished,
        peptonizerFinished,
        peptonizerError,

        runPeptonizer,
        cancelPeptonizer,
        exportStore,
        setImportedData
    }
})();

export type PeptonizerStoreImport = {
    taxaIdsToConfidence: [number, number][];
    taxaNamesToConfidence: [string, number][];
    status: PeptonizerStatus;
}

export type PeptonizerStore = ReturnType<typeof usePeptonizerStore>;

export default usePeptonizerStore;

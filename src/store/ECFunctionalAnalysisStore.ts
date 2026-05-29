import {ref, toRaw} from "vue";
import {defineStore} from "pinia";
import CountTable from "@/logic/processors/CountTable";
import ECFunctionalAnalysisProcessor from "@/logic/processors/functional/ECFunctionalAnalysisProcessor";
import useOntologyStore from "@/store/OntologyStore";
import usePeptonizerAnalysisProgress from "@/store/usePeptonizerAnalysisProgress";

export enum ECFunctionalAnalysisStatus {
    Pending,
    Running,
    Finished,
    Failed
}

const useECFunctionalAnalysisStore = (sampleId: string) => defineStore(`ecFunctionalAnalysisStore_${sampleId}`, () => {
    const status = ref<ECFunctionalAnalysisStatus>(ECFunctionalAnalysisStatus.Pending);
    const ecTermsToConfidence = ref<Map<string, number> | undefined>();

    const {
        currentProgress,
        etaSeconds,
        started: analysisStarted,
        initializationFinished: analysisInitializationFinished,
        finished: analysisFinished,
        createListener
    } = usePeptonizerAnalysisProgress();
    const analysisError = ref<string>("");

    let ecFunctionalAnalysisProcessor: ECFunctionalAnalysisProcessor | undefined;

    const runECFunctionalAnalysis = async (
        peptideCountTable: CountTable<string>,
        peptidesFunctions: Map<string, string[]>,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        // Prevent concurrent runs
        if (status.value === ECFunctionalAnalysisStatus.Running) return;
        status.value = ECFunctionalAnalysisStatus.Running;

        // Reset to initial values
        ecTermsToConfidence.value = undefined;
        analysisError.value = "";

        const listener = createListener();

        try {
            ecFunctionalAnalysisProcessor = new ECFunctionalAnalysisProcessor();
            const ecAnalysisData = await ecFunctionalAnalysisProcessor.runECFunctionalAnalysis(
                peptidesFunctions,
                peptideCountTable,
                listener,
                equateIl,
                peptideIntensities
            );

            // No data is returned if execution has been cancelled by the user
            if (!ecAnalysisData) {
                status.value = ECFunctionalAnalysisStatus.Pending;
                return;
            }

            ecTermsToConfidence.value = ecAnalysisData;

            // Update ontology with EC terms
            const {updateEcOntology} = useOntologyStore();
            await updateEcOntology(Array.from(ecTermsToConfidence.value.keys()));

            status.value = ECFunctionalAnalysisStatus.Finished;
        } catch (error) {
            status.value = ECFunctionalAnalysisStatus.Failed;
            console.log(error);
            analysisError.value = (error as any).toString();
        }
    }

    const cancelECFunctionalAnalysis = () => {
        if (ecFunctionalAnalysisProcessor) {
            ecFunctionalAnalysisProcessor.cancelECFunctionalAnalysis();
        }
        status.value = ECFunctionalAnalysisStatus.Pending;
    }

    const exportStore = (): ECFunctionalAnalysisStoreImport | undefined => {
        if (ecTermsToConfidence.value) {
            return {
                ecTermsToConfidence: Array.from(toRaw(ecTermsToConfidence.value).entries()),
                status: status.value
            }
        }

        return undefined;
    }

    const setImportedData = (storeImport: ECFunctionalAnalysisStoreImport) => {
        ecTermsToConfidence.value = new Map<string, number>(storeImport.ecTermsToConfidence);
        status.value = ECFunctionalAnalysisStatus.Finished;
    }

    return {
        ecTermsToConfidence,

        status,
        currentProgress,
        etaSeconds,
        analysisStarted,
        analysisInitializationFinished,
        analysisFinished,
        analysisError,

        runECFunctionalAnalysis,
        cancelECFunctionalAnalysis,
        exportStore,
        setImportedData
    }
})();

export type ECFunctionalAnalysisStoreImport = {
    ecTermsToConfidence: [string, number][];
    status: ECFunctionalAnalysisStatus;
}

export type ECFunctionalAnalysisStore = ReturnType<typeof useECFunctionalAnalysisStore>;

export default useECFunctionalAnalysisStore;

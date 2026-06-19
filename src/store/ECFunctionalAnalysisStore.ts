import {ref, toRaw} from "vue";
import {defineStore} from "pinia";
import CountTable from "@/logic/processors/CountTable";
import FunctionalAnalysisProcessor from "@/logic/processors/functional/FunctionalAnalysisProcessor";
import useOntologyStore from "@/store/OntologyStore";
import usePeptonizerAnalysisProgress from "@/store/usePeptonizerAnalysisProgress";
import {FunctionalAnalysisStatus} from "@/store/FunctionalAnalysisStatus";

export { FunctionalAnalysisStatus as ECFunctionalAnalysisStatus };

const useECFunctionalAnalysisStore = (sampleId: string) => defineStore(`ecFunctionalAnalysisStore_${sampleId}`, () => {
    const status = ref<FunctionalAnalysisStatus>(FunctionalAnalysisStatus.Pending);
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

    let processor: FunctionalAnalysisProcessor | undefined;

    const runECFunctionalAnalysis = async (
        peptideCountTable: CountTable<string>,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        // Prevent concurrent runs
        if (status.value === FunctionalAnalysisStatus.Running) return;
        status.value = FunctionalAnalysisStatus.Running;

        // Reset to initial values
        ecTermsToConfidence.value = undefined;
        analysisError.value = "";

        const listener = createListener();

        try {
            processor = new FunctionalAnalysisProcessor();
            const ecAnalysisData = await processor.runFunctionalAnalysisFromPeptideProteinPairs(
                "ec",
                peptideCountTable,
                listener,
                equateIl,
                peptideIntensities,
                { analysisLabel: "EC Functional Analysis" }
            );

            // No data is returned if execution has been cancelled by the user
            if (!ecAnalysisData) {
                status.value = FunctionalAnalysisStatus.Pending;
                return;
            }

            ecTermsToConfidence.value = ecAnalysisData;

            // Update ontology with EC terms
            const {updateEcOntology} = useOntologyStore();
            await updateEcOntology(Array.from(ecTermsToConfidence.value.keys()));

            status.value = FunctionalAnalysisStatus.Finished;
        } catch (error) {
            status.value = FunctionalAnalysisStatus.Failed;
            console.log(error);
            analysisError.value = (error as any).toString();
        }
    }

    const cancelECFunctionalAnalysis = () => {
        if (processor) {
            processor.cancelFunctionalAnalysis();
        }
        status.value = FunctionalAnalysisStatus.Pending;
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
        status.value = FunctionalAnalysisStatus.Finished;
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
    status: FunctionalAnalysisStatus;
}

export type ECFunctionalAnalysisStore = ReturnType<typeof useECFunctionalAnalysisStore>;

export default useECFunctionalAnalysisStore;

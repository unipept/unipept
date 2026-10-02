import {ref} from "vue";
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
        peptidesFunctions: Map<string, string[]>,
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
            const ecAnalysisData = await processor.runFunctionalAnalysis(
                peptidesFunctions,
                peptideCountTable,
                listener,
                equateIl,
                peptideIntensities
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
        cancelECFunctionalAnalysis
    }
})();

export type ECFunctionalAnalysisStore = ReturnType<typeof useECFunctionalAnalysisStore>;

export default useECFunctionalAnalysisStore;

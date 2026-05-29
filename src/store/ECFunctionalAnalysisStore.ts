import {ref, Ref, toRaw} from "vue";
import {defineStore} from "pinia";
import CountTable from "@/logic/processors/CountTable";
import {PeptonizerProgressListener} from "peptonizer";
import ECFunctionalAnalysisProcessor from "@/logic/processors/functional/ECFunctionalAnalysisProcessor";
import useOntologyStore from "@/store/OntologyStore";
import {ShareableMap} from "shared-memory-datastructures";
import PeptideData from "@/logic/ontology/peptides/PeptideData";

export enum ECFunctionalAnalysisStatus {
    Pending,
    Running,
    Finished,
    Failed
}

class UnipeptECFunctionalAnalysisProgressListener implements PeptonizerProgressListener {
    private totalTasks = 0;
    private tasksFinished = 0;
    private startEpoch = 0;

    constructor(
        private currentProgress: Ref<number>,
        private etaSeconds: Ref<number>,
        private started: Ref<boolean>,
        private initializationFinished: Ref<boolean>,
        private finished: Ref<boolean>
    ) {
        this.currentProgress.value = 0;
        this.etaSeconds.value = 0;
        this.started.value = false;
        this.initializationFinished.value = false;
        this.finished.value = false;
    }

    peptonizerStarted(totalTasks: number, _taskSpecifications: any[]): void {
        this.started.value = true;
        this.totalTasks = totalTasks;
    }

    peptonizerFinished(): void {
        this.finished.value = true;
    }

    peptonizerCancelled() {
        // Not required by Peptonizer
    }

    taskStarted(_parameterSet: any, _workerId: number) {
        if (!this.initializationFinished.value) {
            this.startEpoch = new Date().getTime();
            this.initializationFinished.value = true;
        }
    }

    taskFinished(_parameterSet: any, _workerId: number) {
        this.tasksFinished++;
        this.currentProgress.value = 100 * (this.tasksFinished / this.totalTasks);

        // Avoid division by zero
        if (this.currentProgress.value <= 0) {
            this.etaSeconds.value = 0;
            return
        }

        const currentEpoch = new Date().getTime();
        const timeSinceStart = currentEpoch - this.startEpoch;

        this.etaSeconds.value = (timeSinceStart / this.currentProgress.value) * (100 - this.currentProgress.value);
    }

    graphsUpdated(_currentGraph: number, _totalGraphs: number, _workerId: number): void {
        // Not required
    }

    maxResidualUpdated(_maxResidual: number, _tolerance: number, _workerId: number): void {
        // Not required
    }

    iterationsUpdated(_currentIteration: number, _totalIterations: number, _workerId: number): void {
        // Not required
    }
}

const useECFunctionalAnalysisStore = (sampleId: string) => defineStore(`ecFunctionalAnalysisStore_${sampleId}`, () => {
    const status = ref<ECFunctionalAnalysisStatus>(ECFunctionalAnalysisStatus.Pending);
    const ecIdsToConfidence = ref<Map<string, number> | undefined>();

    const currentProgress = ref<number>(0);
    const etaSeconds = ref<number>(0);
    const analysisStarted = ref<boolean>(false);
    const analysisInitializationFinished = ref<boolean>(false);
    const analysisFinished = ref<boolean>(false);
    const analysisError = ref<string>("");

    let ecFunctionalAnalysisProcessor: ECFunctionalAnalysisProcessor | undefined;

    const runECFunctionalAnalysis = async (
        peptideCountTable: CountTable<string>,
        peptideToData: ShareableMap<string, PeptideData>,
        peptidesFunctions: Map<string, string[]>,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        // Prevent concurrent runs
        if (status.value === ECFunctionalAnalysisStatus.Running) return;
        status.value = ECFunctionalAnalysisStatus.Running;

        // Reset to initial values
        ecIdsToConfidence.value = undefined;
        analysisError.value = "";

        const listener = new UnipeptECFunctionalAnalysisProgressListener(
            currentProgress,
            etaSeconds,
            analysisStarted,
            analysisInitializationFinished,
            analysisFinished
        );

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

            ecIdsToConfidence.value = ecAnalysisData;

            // Update ontology with EC terms
            const {updateEcOntology} = useOntologyStore();
            await updateEcOntology(Array.from(ecIdsToConfidence.value.keys()));

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
        if (ecIdsToConfidence.value) {
            return {
                ecIdsToConfidence: Array.from(toRaw(ecIdsToConfidence.value).entries()),
                status: status.value
            }
        }

        return undefined;
    }

    const setImportedData = (storeImport: ECFunctionalAnalysisStoreImport) => {
        ecIdsToConfidence.value = new Map<string, number>(storeImport.ecIdsToConfidence);
        status.value = ECFunctionalAnalysisStatus.Finished;
    }

    return {
        ecIdsToConfidence,

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
    ecIdsToConfidence: [string, number][];
    status: ECFunctionalAnalysisStatus;
}

export type ECFunctionalAnalysisStore = ReturnType<typeof useECFunctionalAnalysisStore>;

export default useECFunctionalAnalysisStore;

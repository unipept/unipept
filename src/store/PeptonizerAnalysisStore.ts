import {ref, Ref, toRaw} from "vue";
import {defineStore} from "pinia";
import CountTable from "@/logic/processors/CountTable";
import {NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
import {PeptonizerParameterSet, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import PeptonizerProcessor from "@/logic/processors/peptonizer/PeptonizerProcessor";
import useOntologyStore from "@/store/OntologyStore";
import {ShareableMap} from "shared-memory-datastructures";
import PeptideDataV2 from "@/logic/ontology/peptides/PeptideDataV2";
import {Filter} from "@/store/CustomFilterStore";

export enum PeptonizerStatus {
    Pending,
    Running,
    Finished,
    Failed
}

class UnipeptPeptonizerProgressListener implements PeptonizerProgressListener {
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

    peptonizerStarted(totalTasks: number, _taskSpecifications: PeptonizerParameterSet[]): void {
        this.started.value = true;
        this.totalTasks = totalTasks;
    }

    peptonizerFinished(): void {
        this.finished.value = true;
    }

    peptonizerCancelled() {
        // Not required by Peptonizer
    }

    taskStarted(_parameterSet: PeptonizerParameterSet, _workerId: number) {
        if (!this.initializationFinished.value) {
            this.startEpoch = new Date().getTime();
            this.initializationFinished.value = true;
        }
    }

    taskFinished(_parameterSet: PeptonizerParameterSet, _workerId: number) {
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

const usePeptonizerStore = (sampleId: string) => defineStore(`peptonizerStore_${sampleId}`, () => {
    const status = ref<PeptonizerStatus>(PeptonizerStatus.Pending);
    const taxaIdsToConfidence = ref<Map<number, number> | undefined>();
    const taxaNamesToConfidence = ref<Map<string, number> | undefined>();

    const currentProgress = ref<number>(0);
    const etaSeconds = ref<number>(0);
    const peptonizerStarted = ref<boolean>(false);
    const peptonizerInitalizationFinished = ref<boolean>(false);
    const peptonizerFinished = ref<boolean>(false);
    const peptonizerError = ref<string>("");

    let peptonizerProcessor: PeptonizerProcessor | undefined;

    const runPeptonizer = async (
        peptideCountTable: CountTable<string>,
        peptideToData: ShareableMap<string, PeptideDataV2>,
        rank: NcbiRank,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        status.value = PeptonizerStatus.Running;

        // Reset to initial values
        taxaIdsToConfidence.value = undefined;
        taxaNamesToConfidence.value = undefined;
        peptonizerError.value = "";

        const listener = new UnipeptPeptonizerProgressListener(
            currentProgress,
            etaSeconds,
            peptonizerStarted,
            peptonizerInitalizationFinished,
            peptonizerFinished
        );

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

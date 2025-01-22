import {ref, Ref} from "vue";
import {defineStore} from "pinia";
import CountTable from "@/logic/new/CountTable";
import {NcbiRank, NcbiTaxon} from "@/logic/new/ontology/taxonomic/Ncbi";
import {Peptonizer, PeptonizerParameterSet, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import useNcbiOntology from "@/composables/new/ontology/useNcbiOntology";
import PeptonizerProcessor from "@/logic/processors/peptonizer/PeptonizerProcessor";

export enum PeptonizerStatus {
    Pending,
    Running,
    Finished
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

    peptonizerCancelled() {}

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

    graphsUpdated(_currentGraph: number, _totalGraphs: number, _workerId: number): void {}

    maxResidualUpdated(_maxResidual: number, _tolerance: number, _workerId: number): void {}

    iterationsUpdated(_currentIteration: number, _totalIterations: number, _workerId: number): void {}
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

    const selectedTaxa = ref<NcbiTaxon[]>([]);

    let peptonizerProcessor: PeptonizerProcessor | undefined;

    const runPeptonizer = async (
        peptideCountTable: CountTable<string>,
        rank: NcbiRank,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        status.value = PeptonizerStatus.Running;

        // Reset to initial values
        taxaIdsToConfidence.value = undefined;
        taxaNamesToConfidence.value = undefined;

        const listener = new UnipeptPeptonizerProgressListener(
            currentProgress,
            etaSeconds,
            peptonizerStarted,
            peptonizerInitalizationFinished,
            peptonizerFinished
        );

        peptonizerProcessor = new PeptonizerProcessor();
        const peptonizerData = await peptonizerProcessor.runPeptonizer(
            peptideCountTable,
            rank,
            selectedTaxa.value.length > 0 ? selectedTaxa.value.map((x: NcbiTaxon) => x.id) : [1],
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
        const ncbiOntologyUpdater = useNcbiOntology();
        await ncbiOntologyUpdater.update(Array.from(taxaIdsToConfidence.value.keys()), false);

        const ncbiOntology = ncbiOntologyUpdater.ontology;
        taxaNamesToConfidence.value = new Map(Array.from(taxaIdsToConfidence.value.entries()).map(([k, v]) => [ncbiOntology.value.get(k)!.name, v]));

        status.value = PeptonizerStatus.Finished;
    }

    const cancelPeptonizer = () => {
        if (peptonizerProcessor) {
            peptonizerProcessor.cancelPeptonizer();
        }
        status.value = PeptonizerStatus.Pending;
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
        selectedTaxa,

        runPeptonizer,
        cancelPeptonizer
    }
})();

export type PeptonizerStore = ReturnType<typeof usePeptonizerStore>;

export default usePeptonizerStore;

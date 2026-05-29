import {Ref} from "vue";
import {PeptonizerParameterSet, PeptonizerProgressListener} from "peptonizer";

export default class UnipeptAnalysisProgressListener implements PeptonizerProgressListener {
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
        // Not required by Unipept UI at the moment
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

        if (this.currentProgress.value <= 0) {
            this.etaSeconds.value = 0;
            return;
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

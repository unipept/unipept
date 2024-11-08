import {BeliefPropagationParameters, GridSearchProgressListener} from "peptonizer";

export class PeptonizerWorkerStatus {
    private currentParameters?: BeliefPropagationParameters;

    private graphStatus?: {
        currentGraph: number,
        totalGraphs: number
    };

    private iterationStatus?: {
        currentIteration: number,
        maxIterations: number
    };
}

export class PeptonizerProgressListener implements GridSearchProgressListener {
    constructor(
        private statusObj: PeptonizerWorkerStatus
    ) {}

    gridUpdated(currentAlpha: number, currentBeta: number, currentPrior: number, workerId: number): void {

    }

    graphsUpdated(currentGraph: number, totalGraphs: number, workerId: number): void {

    }

    maxResidualUpdated(maxResidual: number, tolerance: number, workerId: number): void {

    }

    iterationsUpdated(currentIteration: number, totalIterations: number, workerId: number): void {

    }
}
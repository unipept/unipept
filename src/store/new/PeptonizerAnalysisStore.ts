import {ref} from "vue";
import {defineStore} from "pinia";
import useSingleAnalysisStore from "@/store/new/SingleAnalysisStore";
import CountTable from "@/logic/new/CountTable";
import {NcbiRank} from "@/logic/new/ontology/taxonomic/Ncbi";
import {Peptonizer, PeptonizerParameterSet, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import useNcbiOntology from "@/composables/new/ontology/useNcbiOntology";
import PeptonizerProcessor from "@/logic/processors/peptonizer/PeptonizerProcessor";

export enum PeptonizerStatus {
    Pending,
    Running,
    Finished
}

// class UIPeptonizerProgressListener implements PeptonizerProgressListener {
//     constructor() {
//
//     }
//
//     peptonizerStarted(totalTasks: number, _taskSpecifications: PeptonizerParameterSet[]) {
//         parameterTuningTasks.value = totalTasks
//     }
//
//     peptonizerFinished() {
//         // Nothing to do...
//     }
//
//     peptonizerCancelled() {
//         console.log("Peptonizer has been cancelled...");
//     }
//
//     taskStarted(parameterSet: PeptonizerParameterSet, workerId: number) {
//         progress.value.get(workerId)!.push(
//             {
//                 currentGraph: 0,
//                 totalGraphs: 0,
//                 currentIteration: 0,
//                 totalIterations: 0,
//                 currentResidual: 0,
//                 minimumResidual: 0,
//                 finished: false,
//                 graphParameters: parameterSet,
//                 workerId
//             }
//         );
//     }
//
//     taskFinished(_parameterSet: PeptonizerParameterSet, workerId: number) {
//         const progressObj = progress.value.get(workerId)!.at(-1)!;
//         progressObj.finished = true;
//     }
//
//     graphsUpdated(currentGraph: number, totalGraphs: number, workerId: number): void {
//         const progressObj = progress.value.get(workerId)!.at(-1)!;
//         progressObj.currentGraph = currentGraph;
//         progressObj.totalGraphs = totalGraphs;
//     }
//
//     maxResidualUpdated(maxResidual: number, tolerance: number, workerId: number): void {
//         const progressObj = progress.value.get(workerId)!.at(-1)!;
//         progressObj.currentResidual = maxResidual;
//         progressObj.minimumResidual = tolerance;
//     }
//
//     iterationsUpdated(currentIteration: number, totalIterations: number, workerId: number): void {
//         const progressObj = progress.value.get(workerId)!.at(-1)!;
//         progressObj.currentIteration = currentIteration;
//         progressObj.totalIterations = totalIterations;
//     }
// }

const usePeptonizerStore = (sampleId: string) => defineStore(`peptonizerStore_${sampleId}`, () => {
    const status = ref<PeptonizerStatus>(PeptonizerStatus.Pending);
    const taxaIdsToConfidence = ref<Map<number, number> | undefined>();
    const taxaNamesToConfidence = ref<Map<string, number> | undefined>();



    let peptonizerProcessor: PeptonizerProcessor | undefined;

    const runPeptonizer = async (
        peptideCountTable: CountTable<string>,
        rank: NcbiRank,
        taxaInGraph: number,
        listener: PeptonizerProgressListener,
        equateIl: boolean,
        peptideIntensities?: Map<string, number>,
    ) => {
        status.value = PeptonizerStatus.Running;

        // Reset to initial values
        taxaIdsToConfidence.value = undefined;
        taxaNamesToConfidence.value = undefined;

        peptonizerProcessor = new PeptonizerProcessor();
        const peptonizerData = await peptonizerProcessor.runPeptonizer(
            peptideCountTable,
            rank,
            taxaInGraph,
            listener,
            equateIl,
            peptideIntensities
        );

        // No data is returned by the peptonizer if it's execution has been cancelled by the user
        if (!peptonizerData) {
            status.value = PeptonizerStatus.Pending;
            return;
        }

        taxaIdsToConfidence.value = new Map<number, number>(peptonizerData.entries().map(([k, v]) => [Number.parseInt(k), v]));

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
        status,
        taxaNamesToConfidence,
        taxaIdsToConfidence,
        runPeptonizer,
        cancelPeptonizer
    }
})();

export type PeptonizerStore = ReturnType<typeof usePeptonizerStore>;

export default usePeptonizerStore;

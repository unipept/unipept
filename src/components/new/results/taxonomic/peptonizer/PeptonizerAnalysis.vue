<template>
    <v-card-text>
        <p>
            Bringing confidence to metaproteomics! The Peptonizer2000 uses peptide sequences and corresponding scores to
            perform species-level taxonomic identification. All potentially identified species are reported, together
            with a confidence score which indicates the probability of this species actually being present in the
            ecosystem under study.
        </p>

        <div class="d-flex justify-center" v-if="peptonizerStore.status === PeptonizerStatus.Pending">
            <v-btn
                @click="startPeptonizer"
                color="primary"
            >
                ↯ Start to peptonize!
            </v-btn>
        </div>
        <div v-if="peptonizerStore.status === PeptonizerStatus.Running">
            <!-- Show progress of the current Peptonizer analysis -->
            <peptonizer-progress :workers="peptonizerWorkers" :progress="progress" :total-tasks="parameterTuningTasks" />
        </div>
        <div v-else-if="peptonizerStore.status === PeptonizerStatus.Finished" class="d-flex justify-center">
            <!-- Show final Peptonizer results to the user -->
            <peptonizer-chart :peptonizer-result="peptonizerStore.peptonizerResult!" class="flex-grow-1" />
        </div>
    </v-card-text>
</template>

<script setup lang="ts">
import CountTable from "@/logic/new/CountTable";
import usePeptonizerStore, {PeptonizerStatus} from "@/store/new/PeptonizerAnalysisStore";
import {Ref, ref} from "vue";
import { PeptonizerParameterSet, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import PeptonizerProgress from "@/components/new/results/taxonomic/peptonizer/PeptonizerProgress.vue";
import {PEPTONIZER_WORKERS} from "@/composables/new/processing/peptonizer/usePeptonizerProcessor";
import PeptonizerChart from "@/components/new/results/taxonomic/peptonizer/PeptonizerChart.vue";

const props = defineProps<{
  peptideCountTable: CountTable<string>
}>();

export interface PeptonizerProgress {
    currentGraph: number,
    totalGraphs: number,
    currentIteration: number,
    totalIterations: number,
    currentResidual: number,
    minimumResidual: number,
    finished: boolean,
    graphParameters: PeptonizerParameterSet,
    workerId: number
}

const peptonizerStore = usePeptonizerStore();
// Maps worker ID onto the tasks that are being executed by the Peptonizer
const progress: Ref<Map<number, PeptonizerProgress[]>> = ref<Map<number, PeptonizerProgress[]>>(new Map())
const parameterTuningTasks: Ref<number> = ref(1);
const peptonizerWorkers: Ref<number> = ref(PEPTONIZER_WORKERS);

class UIPeptonizerProgressListener implements PeptonizerProgressListener {
    peptonizerStarted(totalTasks: number, _taskSpecifications: PeptonizerParameterSet[]) {
        parameterTuningTasks.value = totalTasks
    }

    peptonizerFinished() {
        // Nothing to do...
    }

    taskStarted(parameterSet: PeptonizerParameterSet, workerId: number) {
        progress.value.get(workerId)!.push(
            {
                currentGraph: 0,
                totalGraphs: 0,
                currentIteration: 0,
                totalIterations: 0,
                currentResidual: 0,
                minimumResidual: 0,
                finished: false,
                graphParameters: parameterSet,
                workerId
            }
        );
    }

    taskFinished(_parameterSet: PeptonizerParameterSet, workerId: number) {
        const progressObj = progress.value.get(workerId)!.at(-1)!;
        progressObj.finished = true;
    }

    graphsUpdated(currentGraph: number, totalGraphs: number, workerId: number): void {
        const progressObj = progress.value.get(workerId)!.at(-1)!;
        progressObj.currentGraph = currentGraph;
        progressObj.totalGraphs = totalGraphs;
    }

    maxResidualUpdated(maxResidual: number, tolerance: number, workerId: number): void {
        const progressObj = progress.value.get(workerId)!.at(-1)!;
        progressObj.currentResidual = maxResidual;
        progressObj.minimumResidual = tolerance;
    }

    iterationsUpdated(currentIteration: number, totalIterations: number, workerId: number): void {
        const progressObj = progress.value.get(workerId)!.at(-1)!;
        progressObj.currentIteration = currentIteration;
        progressObj.totalIterations = totalIterations;
    }
}

const startPeptonizer = async () => {
    for (let idx = 0; idx < PEPTONIZER_WORKERS; idx++) {
        progress.value.set(idx, []);
    }

    await peptonizerStore.runPeptonizer(
      props.peptideCountTable,
      new UIPeptonizerProgressListener()
    );

}
</script>

<style scoped>

</style>
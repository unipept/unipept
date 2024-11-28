<template>
    <h2>Peptonizer is running, please wait...</h2>

    <div>
        <h3 class="d-flex align-center">
            <v-progress-circular
                v-if="progress.get(0)!.length === 0"
                size="15"
                indeterminate="disable-shrink"
                class="mr-2"
                color="primary"
                width="3"
            />
            <v-icon
                v-else
                size="15"
                class="mr-2"
                color="green"
            >
                mdi-check-bold
            </v-icon>
            Generating factor graph
        </h3>
    </div>
    <div v-for="(task, idx) of progressTasks">
        <h3 class="d-flex align-center">
            <v-icon
                v-if="task.finished"
                size="15"
                class="mr-2"
                color="green"
            >
                mdi-check-bold
            </v-icon>
            <v-progress-circular
                v-else
                size="15"
                indeterminate="disable-shrink"
                class="mr-2"
                color="primary"
                width="3"
            />
            Tuning parameters α = {{ task.graphParameters.alpha }}, β = {{ task.graphParameters.beta }}, γ = {{ task.graphParameters.prior }} ({{ idx + 1 }} / {{ totalTasks }})
        </h3>
        <div v-if="!task.finished">
            <div>Task scheduled on worker {{ task.workerId }}</div>
            <div>Processing graph {{ task.currentGraph }} out of {{ task.totalGraphs }}, iteration {{ task.currentIteration }} / {{ task.totalIterations }}</div>
            <div>Best residual so far: {{ task.currentResidual }} (tolerance: {{ task.minimumResidual }})</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {PeptonizerProgress} from "@/components/new/results/taxonomic/peptonizer/PeptonizerAnalysis.vue";
import {computed} from "vue";

const props = defineProps<{
    workers: number,
    progress: Map<number, PeptonizerProgress[]>,
    totalTasks: number
}>();

const progressTasks = computed(() => {
    const lastTasks: PeptonizerProgress[] = []; // To store the last items of each array
    const mergedTasks: PeptonizerProgress[] = [];   // To store the merged arrays except last items

    for (const [_workerId, workerTasks] of props.progress.entries()) {
        if (workerTasks.length > 0) {
            lastTasks.push(workerTasks[workerTasks.length - 1]);
            mergedTasks.push(...workerTasks.slice(0, -1));
        }
    }

    return [...mergedTasks, ...lastTasks];
});

</script>

<style scoped>

</style>
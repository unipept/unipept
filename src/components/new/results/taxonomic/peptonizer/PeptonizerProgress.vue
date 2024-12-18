<template>
    <div class="d-flex flex-column align-center">
        <h2 class="mb-4">Peptonizer is running, please wait...</h2>
        <v-progress-linear class="mx-8" :model-value="progressValue" color="primary" />
        <div class="mt-1">{{ progressValue.toFixed(2) }}%</div>
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

const progressValue = computed(() => {
    if (props.totalTasks === 0) {
        return -1;
    }

    let finished = 0;
    for (const [_workerId, workerTasks] of props.progress.entries()) {
        for (const task of workerTasks) {
            if (task.finished) {
                finished++;
            }
        }
    }
    return (finished / props.totalTasks) * 100;
});

</script>

<style scoped>

</style>
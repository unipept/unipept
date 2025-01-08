<template>
    <div class="d-flex flex-column align-center">
        <h2 class="mb-4 d-flex align-center">
            <v-icon size="25px" color="secondary">
                mdi-flash
            </v-icon>
            Peptonizer is running, please wait...
        </h2>
        <v-progress-linear class="mx-8" :indeterminate="!peptonizerInitializationFinished" :model-value="progress" color="primary" />
        <div class="mt-1" v-if="!peptonizerStarted">
            Waiting for Peptonizer to become available or finish a previous task...
        </div>
        <div class="mt-1 d-flex flex-column align-center" v-else-if="peptonizerInitializationFinished">
            <span>{{ progress.toFixed(2) }}%</span>
            <span v-if="progress > 0">Approximately {{ convertDurationToString(Math.round(eta / 1000)) }} remaining</span>
        </div>
        <div class="mt-1" v-else>
            Initializing peptonizer...
        </div>
    </div>
</template>

<script setup lang="ts">
import useTimeFormatter from "@/composables/new/useTimeFormatter";

defineProps<{
    progress: number,
    eta: number,
    peptonizerStarted: boolean,
    peptonizerInitializationFinished: boolean,
    peptonizerFinished: boolean
}>();

const {
    convertDurationToString
} = useTimeFormatter();
</script>

<style scoped>

</style>
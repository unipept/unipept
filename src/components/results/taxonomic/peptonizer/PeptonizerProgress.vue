<template>
    <div class="d-flex flex-column align-center">
        <h2 class="mb-4 d-flex align-center">
            <v-icon
                size="25px"
                color="secondary"
            >
                mdi-flash
            </v-icon>
            Peptonizer is running, please wait...
        </h2>
        <v-progress-linear
            height="8"
            class="mx-8"
            rounded
            :indeterminate="!peptonizerInitializationFinished"
            :model-value="progress"
            color="primary"
            striped
        />
        <div
            v-if="!peptonizerStarted"
            class="mt-1"
        >
            Waiting for Peptonizer to become available or finish a previous task...
        </div>
        <div
            v-else-if="peptonizerInitializationFinished"
            class="mt-1 d-flex flex-column align-center"
        >
            <span>{{ progress.toFixed(2) }}%</span>
            <span v-if="progress > 0">Approximately {{ convertDurationToString(Math.round(eta / 1000)) }} remaining</span>
        </div>
        <div
            v-else
            class="mt-1"
        >
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
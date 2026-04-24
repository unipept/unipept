<template>
    <div>
        <div v-if="analysis.status !== AnalysisStatus.Finished" class="pa-4">
            <v-alert type="warning" variant="tonal">
                Analysis is not yet finished. Pathway data will be available once the analysis completes.
            </v-alert>
        </div>

        <template v-else>
            <sample-pathway-selection
                v-if="!analysis.pathwayPilotStore.selectedPathway"
                :store="analysis.pathwayPilotStore"
                :loading="analysis.pathwayPilotStore.status === PathwayPilotStatus.Loading"
                @retry="retry"
            />

            <sample-pathway-visualization
                v-else
                :store="analysis.pathwayPilotStore"
                :analysis="analysis"
                @back="analysis.pathwayPilotStore.setSelectedPathway(undefined)"
            />
        </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { AnalysisStatus } from '@/store/AnalysisStatus';
import SamplePathwaySelection from "@/components/results/functional/pathway/SamplePathwaySelection.vue";
import SamplePathwayVisualization from "@/components/results/functional/pathway/SamplePathwayVisualization.vue";
import {PathwayPilotStatus} from "@/store/PathwayPilotStore";

const props = defineProps<{
    analysis: SingleAnalysisStore;
}>();

const retry = () => {
    props.analysis.pathwayPilotStore.initialize(
        props.analysis.ecToPeptides,
        props.analysis.peptidesTable
    );
};

const initializeIfReady = () => {
    if (
        props.analysis.status === AnalysisStatus.Finished &&
        props.analysis.pathwayPilotStore.status === PathwayPilotStatus.Pending &&
        props.analysis.ecToPeptides &&
        props.analysis.peptidesTable
    ) { retry(); }
};

// Re-initialize when the analysis prop itself changes (e.g. user switches samples
// without the component being remounted).
watch(() => props.analysis, initializeIfReady);

watch(() => props.analysis.status, (newStatus) => {
    if (newStatus === AnalysisStatus.Finished) {
        initializeIfReady();
    }
});

onMounted(() => {
    initializeIfReady();
});
</script>

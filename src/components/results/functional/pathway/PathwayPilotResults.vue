<template>
    <div>
        <div v-if="analysis.status !== AnalysisStatus.Finished" class="pa-4">
            <v-alert type="warning" variant="tonal">
                Analysis is not yet finished. Pathway data will be available once the analysis completes.
            </v-alert>
        </div>

        <template v-else>
            <pathway-visualisation-panel
                v-if="analysis.pathwayPilotStore.selectedPathway"
                :store="analysis.pathwayPilotStore"
                :analysis="analysis"
                @back="analysis.pathwayPilotStore.setSelectedPathway(undefined)"
            />
            <div v-else-if="analysis.pathwayPilotStore.status === PathwayPilotStatus.Loading" class="d-flex justify-center align-center py-8">
                <v-progress-circular indeterminate color="primary" />
                <span class="ml-4">Loading pathway data...</span>
            </div>
            <pathway-selection-panel
                v-else
                :store="analysis.pathwayPilotStore"
            />
        </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { AnalysisStatus } from '@/store/AnalysisStatus';
import { PathwayPilotStatus } from '@/store/PathwayPilotStore';
import PathwaySelectionPanel from '@/components/results/functional/pathway/PathwaySelectionPanel.vue';
import PathwayVisualisationPanel from '@/components/results/functional/pathway/PathwayVisualisationPanel.vue';

const props = defineProps<{
    analysis: SingleAnalysisStore;
}>();

const initializeIfReady = () => {
    if (
        props.analysis.status === AnalysisStatus.Finished &&
        props.analysis.pathwayPilotStore.status === PathwayPilotStatus.Pending &&
        props.analysis.ecToPeptides &&
        props.analysis.peptidesTable
    ) {
        props.analysis.pathwayPilotStore.initialize(
            props.analysis.ecToPeptides,
            props.analysis.peptidesTable
        );
    }
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

<template>
    <div>
        <comparative-pathway-selection
            v-if="!selectedPathway"
            :analyses="analyses"
            :loading="loadingMappings"
            @select="selectPathway"
        />

        <comparative-pathway-visualization
            v-else
            :analyses="analyses"
            :groups="groups"
            :selected-pathway="selectedPathway"
            @back="selectedPathway = undefined"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { GroupAnalysisStore } from '@/store/GroupAnalysisStore';
import { AnalysisStatus } from '@/store/AnalysisStatus';
import { PathwayPilotStatus } from '@/store/PathwayPilotStore';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';
import useAppStateStore from '@/store/AppStateStore';
import ComparativePathwaySelection, { MergedPathwayItem } from './ComparativePathwaySelection.vue';
import ComparativePathwayVisualization from './ComparativePathwayVisualization.vue';

const props = defineProps<{
    analyses: SingleAnalysisStore[];
    groups: GroupAnalysisStore[];
}>();

const mappingStore = usePathwayPilotMappingStore();
const appStateStore = useAppStateStore();

const selectedPathway = computed({
    get: () => appStateStore.comparativeAnalysisState.selectedComparativePathway,
    set: (v) => { appStateStore.comparativeAnalysisState.selectedComparativePathway = v; }
});

const loadingMappings = ref(false);

const selectPathway = (item: MergedPathwayItem) => {
    selectedPathway.value = item;
};

const ensureInitialized = async () => {
    loadingMappings.value = true;
    try {
        await mappingStore.fetchMappings();

        if (appStateStore.pendingComparativePathwayId && mappingStore.pathwayMapping) {
            const id = appStateStore.pendingComparativePathwayId;
            const info = mappingStore.pathwayMapping.get(id);
            if (info) {
                selectedPathway.value = {
                    id, name: info.name, category: info.category, subCategory: info.subCategory, count: 0
                };
            }
            appStateStore.pendingComparativePathwayId = undefined;
        }

        await Promise.all(
            props.analyses
                .filter(analysis =>
                    analysis.status === AnalysisStatus.Finished &&
                    analysis.pathwayPilotStore.status === PathwayPilotStatus.Pending &&
                    analysis.ecToPeptides &&
                    analysis.peptidesTable
                )
                .map(analysis => analysis.pathwayPilotStore.initialize(
                    analysis.ecToPeptides!,
                    analysis.peptidesTable!
                ))
        );
    } finally {
        loadingMappings.value = false;
    }
};

onMounted(ensureInitialized);

watch(() => props.analyses, ensureInitialized);
</script>

<template>
    <pathway-visualization-viewer
        :viz="viz"
        :colored-areas="coloredAreas"
        :selected-pathway="props.selectedPathway"
        :legend-items="legendItems"
        :show-differential="showDifferential && canShowDifferential"
        :differential-labels="differentialLabels"
        :differential-colors="differentialColors"
        :get-ec-stats="getGroupEcStats"
        :get-area-stats="getAreaStats"
        :show-csv-export="true"
        :crowding-warning="(useGroups ? effectiveGroups.length : props.analyses.length) > 6"
        @back="emit('back')"
        @export-csv="exportAsCsv"
        @retry="retryViz"
    >
        <template #settings>
            <v-row class="mt-0" no-gutters>
                <v-col cols="5" class="pr-4">
                    <div class="text-subtitle-1 font-weight-bold mb-1">Use groups</div>
                    <div class="text-body-1 text-medium-emphasis mb-2">
                        Aggregates analyses by their group and colors each pathway node by which groups have matching EC numbers, rather than per individual analysis.
                    </div>
                    <v-checkbox
                        v-model="useGroups"
                        label="Enable grouping"
                        color="primary"
                        density="compact"
                        hide-details
                    />
                </v-col>
                <v-divider vertical class="mx-0" />
                <v-col cols="6" class="pl-4">
                    <div class="text-subtitle-1 font-weight-bold mb-1">Differential abundance</div>
                    <div class="text-body-1 text-medium-emphasis mb-2">
                        Colors each pathway node by the relative abundance difference between two items. Requires exactly 2 groups (when grouping is enabled) or exactly 2 analyses.
                    </div>
                    <v-switch
                        v-model="showDifferential"
                        label="Show differential"
                        color="primary"
                        density="compact"
                        hide-details
                        :disabled="!canShowDifferential"
                    />
                </v-col>
            </v-row>
        </template>
    </pathway-visualization-viewer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { GroupAnalysisStore } from '@/store/GroupAnalysisStore';
import { PathwayItem } from '@/store/PathwayPilotStore';
import { usePathwayLegend } from '@/composables/pathway/usePathwayLegend';
import { usePathwayVisualization } from '@/composables/pathway/usePathwayVisualization';
import { usePathwayCsvExport } from '@/composables/pathway/usePathwayCsvExport';
import { usePathwayColoring } from '@/composables/pathway/usePathwayColoring';
import type { ColoringItem } from '@/composables/pathway/usePathwayColoring';
import PathwayVisualizationViewer from '@/components/pathway/PathwayVisualizationViewer.vue';

const props = defineProps<{
    analyses: SingleAnalysisStore[];
    groups: GroupAnalysisStore[];
    selectedPathway: PathwayItem;
}>();

const emit = defineEmits<{
    back: [];
}>();

const viz = usePathwayVisualization();
const { exportComparativeAnalysis } = usePathwayCsvExport();

const useGroups = ref(false);

const effectiveGroups = computed<GroupAnalysisStore[]>(() =>
    props.groups.filter(g =>
        (g.analyses as SingleAnalysisStore[]).some(a => props.analyses.some(pa => pa.id === a.id))
    )
);

const { legendItems, showDifferential, canShowDifferential, differentialLabels, differentialColors } = usePathwayLegend({
    items: () => useGroups.value
        ? effectiveGroups.value.map(g => ({ label: g.name }))
        : props.analyses.map(a => ({ label: a.name })),
    canDifferential: () =>
        (useGroups.value && effectiveGroups.value.length === 2) ||
        (!useGroups.value && props.analyses.length === 2),
});

const analysesForGroup = (group: GroupAnalysisStore): SingleAnalysisStore[] =>
    (group.analyses as SingleAnalysisStore[]).filter(a => props.analyses.some(pa => pa.id === a.id));

const groupTotalCounts = computed<number[]>(() =>
    effectiveGroups.value.map(group =>
        analysesForGroup(group)
            .flatMap(analysis => analysis.peptidesTable ? [...analysis.peptidesTable.counts.values()] : [])
            .reduce((total, count) => total + count, 0)
    )
);

const analysisTotalCounts = computed<number[]>(() =>
    props.analyses.map(analysis =>
        (analysis.peptidesTable ? [...analysis.peptidesTable.counts.values()] : [])
            .reduce((total, count) => total + count, 0)
    )
);

const getGroupCountForArea = (groupAnalyses: SingleAnalysisStore[], area: any): number => {
    const ecIds: string[] = (area?.info?.ecNumbers ?? []).map((ec: any) => ec.id);
    return groupAnalyses.reduce((total, analysis) => {
        return total + ecIds
            .filter(ecId => analysis.pathwayPilotStore.ecs.has(ecId))
            .reduce((s, ecId) => s + analysis.pathwayPilotStore.getEcCount(ecId), 0);
    }, 0);
};

const getGroupEcStats = computed(() => {
    if (!useGroups.value) {
        return (ecId: string) => props.analyses.map((analysis, i) => ({
            name: analysis.name,
            color: legendItems.value[i].color,
            matched: analysis.pathwayPilotStore.getEcCount(ecId),
            total: analysisTotalCounts.value[i] ?? 0
        }));
    }
    if (effectiveGroups.value.length === 0) return undefined;
    return (ecId: string) => effectiveGroups.value.map((group, i) => ({
        name: group.name,
        color: legendItems.value[i].color,
        matched: analysesForGroup(group).reduce(
            (sum, a) => sum + a.pathwayPilotStore.getEcCount(ecId), 0
        ),
        total: groupTotalCounts.value[i] ?? 0
    }));
});

const getAreaStats = computed(() => {
    if (!useGroups.value) {
        return (area: any) => props.analyses.map((analysis, i) => ({
            name: analysis.name,
            color: legendItems.value[i].color,
            count: getGroupCountForArea([analysis], area),
            total: analysisTotalCounts.value[i] ?? 0
        }));
    }
    if (effectiveGroups.value.length === 0) return undefined;
    return (area: any) => effectiveGroups.value.map((group, i) => ({
        name: group.name,
        color: legendItems.value[i].color,
        count: getGroupCountForArea(analysesForGroup(group), area),
        total: groupTotalCounts.value[i] ?? 0
    }));
});

const coloringItems = computed<ColoringItem[]>(() => {
    if (useGroups.value) {
        return effectiveGroups.value.map((group, i) => {
            const groupAnalyses = analysesForGroup(group);
            return {
                color: legendItems.value[i].color,
                hasMatch: (area: any) =>
                    area?.info?.ecNumbers?.some((ec: any) =>
                        groupAnalyses.some(a => a.pathwayPilotStore.ecs.has(ec.id ?? ec))
                    ) ?? false,
                countForArea: (area: any) => getGroupCountForArea(groupAnalyses, area),
                total: groupTotalCounts.value[i] ?? 0,
            };
        });
    }
    return props.analyses.map((analysis, i) => ({
        color: legendItems.value[i].color,
        hasMatch: (area: any) =>
            area?.info?.ecNumbers?.some((ec: any) =>
                analysis.pathwayPilotStore.ecs.has(ec.id ?? ec)
            ) ?? false,
        countForArea: (area: any) => getGroupCountForArea([analysis], area),
        total: analysisTotalCounts.value[i] ?? 0,
    }));
});

const { coloredAreas } = usePathwayColoring({
    rawAreas: viz.rawAreas,
    showDifferential,
    canShowDifferential,
    items: coloringItems,
    defaultColoring: () => [],
});

const exportAsCsv = (delimiter: string) => exportComparativeAnalysis(props.analyses, props.groups, delimiter);

const retryViz = () => viz.fetchVisualization(props.selectedPathway.id);

watch(() => props.selectedPathway, (pathway) => {
    if (pathway) viz.fetchVisualization(pathway.id);
});

onMounted(() => {
    viz.fetchVisualization(props.selectedPathway.id);
});
</script>

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
                    <div class="text-subtitle-2 mb-1">Use groups</div>
                    <div class="text-caption text-medium-emphasis mb-2">
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
                    <div class="text-subtitle-2 mb-1">Differential abundance</div>
                    <div class="text-caption text-medium-emphasis mb-2">
                        Colors each pathway node by the relative abundance difference between the two groups. Requires exactly 2 groups.
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
import * as d3 from 'd3';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { GroupAnalysisStore } from '@/store/GroupAnalysisStore';
import { PathwayItem } from '@/store/PathwayPilotStore';
import { isSelectable } from '@/composables/pathway/usePathwayColors';
import { usePathwayLegend } from '@/composables/pathway/usePathwayLegend';
import { usePathwayVisualization } from '@/composables/pathway/usePathwayVisualization';
import { usePathwayCsvExport } from '@/composables/pathway/usePathwayCsvExport';
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

const useGroups = ref(true);

const effectiveGroups = computed<GroupAnalysisStore[]>(() =>
    props.groups.filter(g =>
        (g.analyses as SingleAnalysisStore[]).some(a => props.analyses.some(pa => pa.id === a.id))
    )
);

const { legendItems, showDifferential, canShowDifferential, differentialLabels, differentialColors } = usePathwayLegend({
    items: () => useGroups.value
        ? effectiveGroups.value.map(g => ({ label: g.name }))
        : props.analyses.map(a => ({ label: a.name })),
    canDifferential: () => useGroups.value && effectiveGroups.value.length === 2,
});

const analysesForGroup = (group: GroupAnalysisStore): SingleAnalysisStore[] =>
    (group.analyses as SingleAnalysisStore[]).filter(a => props.analyses.some(pa => pa.id === a.id));

const groupTotalCounts = computed<number[]>(() =>
    effectiveGroups.value.map(group => {
        let total = 0;
        for (const analysis of analysesForGroup(group)) {
            if (analysis.peptidesTable) {
                for (const count of analysis.peptidesTable.counts.values()) {
                    total += count;
                }
            }
        }
        return total;
    })
);

const analysisTotalCounts = computed<number[]>(() =>
    props.analyses.map(analysis => {
        let total = 0;
        if (analysis.peptidesTable) {
            for (const count of analysis.peptidesTable.counts.values()) {
                total += count;
            }
        }
        return total;
    })
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

const coloredAreas = computed(() => {
    if (useGroups.value && showDifferential.value && effectiveGroups.value.length === 2) {
        const group1Analyses = analysesForGroup(effectiveGroups.value[0]);
        const group2Analyses = analysesForGroup(effectiveGroups.value[1]);
        const p1 = groupTotalCounts.value[0] ?? 0;
        const p2 = groupTotalCounts.value[1] ?? 0;

        if (p1 === 0 || p2 === 0) {
            return viz.rawAreas.value.map(area => ({ ...area, colors: [] }));
        }

        let min = 0, max = 0;
        const withValues = viz.rawAreas.value.map(area => {
            if (!isSelectable(area)) return { area, value: null as number | null };

            const x = getGroupCountForArea(group1Analyses, area);
            const y = getGroupCountForArea(group2Analyses, area);

            if (x > 0 || y > 0) {
                const diff = y / p2 - x / p1;
                min = Math.min(min, diff);
                max = Math.max(max, diff);
                return { area, value: diff };
            }
            return { area, value: null as number | null };
        });

        const colorScale = d3.scaleDiverging(
            [min, 0, max],
            d3.interpolateRgbBasis([legendItems.value[0].color, '#ffffe0', legendItems.value[1].color])
        );

        return withValues.map(({ area, value }) => ({
            ...area,
            colors: value !== null ? [colorScale(value)] : []
        }));
    }

    if (useGroups.value) {
        return viz.rawAreas.value.map(area => {
            if (!isSelectable(area)) return { ...area, colors: [] };

            const colors: string[] = [];
            for (let i = 0; i < effectiveGroups.value.length; i++) {
                const groupAnalyses = analysesForGroup(effectiveGroups.value[i]);
                const hasMatch = area?.info?.ecNumbers?.some((ec: any) =>
                    groupAnalyses.some(a => a.pathwayPilotStore.ecs.has(ec.id ?? ec))
                ) ?? false;
                if (hasMatch) colors.push(legendItems.value[i].color);
            }
            return { ...area, colors };
        });
    }

    return viz.rawAreas.value.map(area => {
        if (!isSelectable(area)) return { ...area, colors: [] };

        const matchingColors = props.analyses
            .map((analysis, i) => ({
                color: legendItems.value[i].color,
                matches: area?.info?.ecNumbers?.some((ec: any) =>
                    analysis.pathwayPilotStore.ecs.has(ec.id ?? ec)
                ) ?? false
            }))
            .filter(c => c.matches)
            .map(c => c.color);

        return { ...area, colors: matchingColors };
    });
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

<template>
    <div>
        <!-- Pathway visualization -->
        <template v-if="selectedPathway">
            <pathway-visualization-viewer
                :viz="viz"
                :colored-areas="coloredAreas"
                :selected-pathway="selectedPathway"
                :legend-items="legendItems"
                :legend-visible="true"
                :show-differential="showDifferential"
                :differential-labels="showDifferential && effectiveGroups.length === 2 ? [effectiveGroups[0].name, effectiveGroups[1].name] : undefined"
                :differential-colors="showDifferential && effectiveGroups.length === 2 ? [groupColors[0], groupColors[1]] : undefined"
                :get-ec-stats="getGroupEcStats"
                :get-area-stats="getAreaStats"
                :show-csv-export="false"
                @back="selectedPathway = undefined"
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

        <!-- Pathway selection -->
        <pathway-selection-table
            v-else
            :filters="filters"
            :headers="tableHeaders"
            sort-key="totalCount"
            :loading="loadingMappings"
            :category-options="categoryOptions"
            :compound-options="compoundOptions"
            :subtitle="`Select a KEGG metabolic pathway to compare EC number coverage across all selected analyses. Colors indicate which analyses have matching EC numbers for each pathway area.`"
            @select="selectPathway"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import * as d3 from 'd3';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { GroupAnalysisStore } from '@/store/GroupAnalysisStore';
import { AnalysisStatus } from '@/store/AnalysisStatus';
import { PathwayPilotStatus, PathwayItem } from '@/store/PathwayPilotStore';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';
import useAppStateStore from '@/store/AppStateStore';
import { pathwayGroups } from '@/logic/PathwayGroups';
import { PATHWAY_COLORS, categoryColor, isSelectable } from '@/composables/pathway/usePathwayColors';
import { usePathwayFilters } from '@/composables/pathway/usePathwayFilters';
import { usePathwayVisualization } from '@/composables/pathway/usePathwayVisualization';
import PathwaySelectionTable from '@/components/pathway/PathwaySelectionTable.vue';
import PathwayVisualizationViewer from '@/components/pathway/PathwayVisualizationViewer.vue';

const props = defineProps<{
    analyses: SingleAnalysisStore[];
    groups: GroupAnalysisStore[];
}>();

const mappingStore = usePathwayPilotMappingStore();
const appStateStore = useAppStateStore();

const viz = usePathwayVisualization();

const selectedPathway = computed({
    get: () => appStateStore.comparativeAnalysisState.selectedComparativePathway,
    set: (v) => { appStateStore.comparativeAnalysisState.selectedComparativePathway = v; }
});

const useGroups = ref(true);
const showDifferential = ref(false);
const loadingMappings = ref(false);

const analysisColors = computed(() =>
    props.analyses.map((_, i) => PATHWAY_COLORS[i % PATHWAY_COLORS.length])
);

const effectiveGroups = computed<GroupAnalysisStore[]>(() =>
    props.groups.filter(g =>
        (g.analyses as SingleAnalysisStore[]).some(a => props.analyses.some(pa => pa.id === a.id))
    )
);

const groupColors = computed(() =>
    effectiveGroups.value.map((_, i) => PATHWAY_COLORS[i % PATHWAY_COLORS.length])
);

const canShowDifferential = computed(() => useGroups.value && effectiveGroups.value.length === 2);

watch(canShowDifferential, (can) => {
    if (!can) showDifferential.value = false;
});

const legendItems = computed(() => {
    if (useGroups.value) {
        return effectiveGroups.value.map((g, i) => ({ label: g.name, color: groupColors.value[i] }));
    }
    return props.analyses.map((a, i) => ({ label: a.name, color: analysisColors.value[i] }));
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

const getGroupEcStats = computed(() => {
    if (!useGroups.value || effectiveGroups.value.length === 0) return undefined;
    return (ecId: string) => effectiveGroups.value.map((group, i) => ({
        name: group.name,
        color: groupColors.value[i],
        matched: analysesForGroup(group).reduce(
            (sum, a) => sum + a.pathwayPilotStore.getEcCount(ecId), 0
        ),
        total: groupTotalCounts.value[i] ?? 0
    }));
});

const getAreaStats = computed(() => {
    if (!useGroups.value || effectiveGroups.value.length === 0) return undefined;
    return (area: any) => effectiveGroups.value.map((group, i) => ({
        name: group.name,
        color: groupColors.value[i],
        count: getGroupCountForArea(analysesForGroup(group), area),
        total: groupTotalCounts.value[i] ?? 0
    }));
});

const getGroupCountForArea = (groupAnalyses: SingleAnalysisStore[], area: any): number => {
    const ecIds: string[] = (area?.info?.ecNumbers ?? []).map((ec: any) => ec.id);
    return groupAnalyses.reduce((total, analysis) => {
        return total + ecIds
            .filter(ecId => analysis.pathwayPilotStore.ecs.has(ecId))
            .reduce((s, ecId) => s + analysis.pathwayPilotStore.getEcCount(ecId), 0);
    }, 0);
};

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
            d3.interpolateRgbBasis([groupColors.value[0], '#ffffe0', groupColors.value[1]])
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
                if (hasMatch) colors.push(groupColors.value[i]);
            }
            return { ...area, colors };
        });
    }

    return viz.rawAreas.value.map(area => {
        if (!isSelectable(area)) return { ...area, colors: [] };

        const matchingColors = props.analyses
            .map((analysis, i) => ({
                color: analysisColors.value[i],
                matches: area?.info?.ecNumbers?.some((ec: any) =>
                    analysis.pathwayPilotStore.ecs.has(ec.id ?? ec)
                ) ?? false
            }))
            .filter(c => c.matches)
            .map(c => c.color);

        return { ...area, colors: matchingColors };
    });
});

// ---- Pathway selection table ----

interface MergedPathwayItem extends PathwayItem {
    totalCount: number;
    matchingAnalyses: SingleAnalysisStore[];
}

const tableHeaders = [
    { title: 'ID', key: 'id', sortable: true, width: '110px' },
    { title: 'Category', key: 'category', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Total count', key: 'totalCount', sortable: true, align: 'end' as const }
];

const mergedPathwayItems = computed<MergedPathwayItem[]>(() => {
    if (!mappingStore.pathwayMapping) return [];

    const pathwayMap = new Map<string, MergedPathwayItem>();

    for (const analysis of props.analyses) {
        if (analysis.pathwayPilotStore.status !== PathwayPilotStatus.Ready) continue;

        for (const item of analysis.pathwayPilotStore.pathwayItems) {
            if (!pathwayMap.has(item.id)) {
                pathwayMap.set(item.id, { ...item, totalCount: 0, matchingAnalyses: [] });
            }
            const merged = pathwayMap.get(item.id)!;
            merged.totalCount += item.count;
            if (item.count > 0 && !merged.matchingAnalyses.includes(analysis)) {
                merged.matchingAnalyses.push(analysis);
            }
        }
    }

    return Array.from(pathwayMap.values()).sort((a, b) => b.totalCount - a.totalCount);
});

const filters = usePathwayFilters({
    items: () => mergedPathwayItems.value,
    pathwaysForEc: (ec) => {
        const result = new Set<string>();
        for (const analysis of props.analyses) {
            for (const p of analysis.pathwayPilotStore.pathwaysForEc(ec)) result.add(p);
        }
        return result;
    },
    pathwaysForCompound: (c) => {
        const result = new Set<string>();
        for (const analysis of props.analyses) {
            for (const p of analysis.pathwayPilotStore.pathwaysForCompound(c)) result.add(p);
        }
        return result;
    },
    allEcs: () => {
        const ecSet = new Set<string>();
        for (const analysis of props.analyses) {
            for (const ec of analysis.pathwayPilotStore.ecs) ecSet.add(ec);
        }
        return ecSet;
    },
});

const categoryOptions = computed(() =>
    [...new Set(mergedPathwayItems.value.map(item => item.subCategory || item.category))]
        .sort((a, b) => {
            const iA = pathwayGroups.indexOf(a), iB = pathwayGroups.indexOf(b);
            if (iA >= 0 && iB >= 0) return iA - iB;
            return iA >= 0 ? -1 : iB >= 0 ? 1 : a.localeCompare(b);
        })
        .map(name => ({ value: name, title: name, color: categoryColor(name) }))
);

const compoundOptions = computed(() => {
    const compoundSet = new Set<string>();
    for (const analysis of props.analyses) {
        for (const c of analysis.pathwayPilotStore.compounds) {
            compoundSet.add(c);
        }
    }
    return Array.from(compoundSet)
        .map(id => ({
            value: id,
            title: `${id}: ${mappingStore.compoundMapping?.get(id)?.names?.[0] ?? 'Unknown'}`
        }))
        .sort((a, b) => a.value.localeCompare(b.value));
});

// ---- Visualization ----

const selectPathway = (item: MergedPathwayItem) => {
    selectedPathway.value = item;
    viz.fetchVisualization(item.id);
};

const retryViz = () => {
    if (selectedPathway.value) viz.fetchVisualization(selectedPathway.value.id);
};

// ---- Initialization ----

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

        for (const analysis of props.analyses) {
            if (
                analysis.status === AnalysisStatus.Finished &&
                analysis.pathwayPilotStore.status === PathwayPilotStatus.Pending &&
                analysis.ecToPeptides &&
                analysis.peptidesTable
            ) {
                await analysis.pathwayPilotStore.initialize(
                    analysis.ecToPeptides,
                    analysis.peptidesTable
                );
            }
        }
    } finally {
        loadingMappings.value = false;
    }
};

onMounted(async () => {
    if (selectedPathway.value) {
        viz.fetchVisualization(selectedPathway.value.id);
        ensureInitialized();
    } else {
        await ensureInitialized();
        const pathway = selectedPathway.value as PathwayItem | undefined;
        if (pathway) {
            viz.fetchVisualization(pathway.id);
        }
    }
});

watch(() => props.analyses, ensureInitialized);
</script>

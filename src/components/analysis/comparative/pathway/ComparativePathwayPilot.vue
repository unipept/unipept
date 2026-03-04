<template>
    <div ref="fullscreenRoot">
        <!-- Pathway visualization -->
        <template v-if="selectedPathway">
            <visualization-controls
                :caption="!loadingViz ? 'Scroll to zoom, drag to pan, click a node to reveal additional information' : undefined"
                :download="!loadingViz && !isFullscreen ? () => downloadDialogOpen = true : undefined"
                :reset="imageLoaded ? resetView : undefined"
                :fullscreen="!loadingViz ? toggleFullscreen : undefined"
            >
                <template #visualization>
                    <div
                        :class="{ 'd-flex flex-column': isFullscreen }"
                        :style="{ paddingTop: loadingViz ? 0 : '40px', height: isFullscreen ? '100%' : 'auto' }"
                    >
                        <!-- PathwayPilot settings -->
                        <div v-show="!loadingViz" class="mx-4 mt-3 mb-3">
                            <v-expansion-panels color="grey-lighten-4" v-model="settingsPanelOpen">
                                <v-expansion-panel value="settings">
                                    <v-expansion-panel-title>
                                        <v-icon class="mr-2">mdi-cog</v-icon>
                                        PathwayPilot settings
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text>
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
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </div>

                        <template v-if="loadingViz">
                            <v-card-text>
                                <div class="px-4 pt-1 pb-2">
                                    <span class="text-h6">{{ selectedPathway!.id }}: {{ selectedPathway!.name }}</span>
                                </div>
                                <v-progress-linear indeterminate color="primary" />
                                <div class="d-flex justify-center py-6">
                                    <span class="text-body-2 text-medium-emphasis">Loading pathway visualization...</span>
                                </div>
                            </v-card-text>
                        </template>

                        <v-alert v-else-if="vizError" type="error" variant="tonal" class="ma-4">
                            <div>Failed to load pathway visualization.</div>
                            <v-btn variant="tonal" class="mt-3" prepend-icon="mdi-refresh" @click="retryViz">
                                Try again
                            </v-btn>
                        </v-alert>

                        <div
                            v-else-if="pngUrl"
                            ref="vizWrapper"
                            class="pathway-wrapper"
                            :style="isFullscreen ? { flex: '1', minHeight: '0' } : { height: containerHeight + 'px' }"
                        >
                            <pathway-interactive-image
                                v-model:scale="scale"
                                v-model:translate="translate"
                                style="width: 100%; height: 100%;"
                            >
                                <div style="position: relative; display: inline-block;">
                                    <img
                                        ref="imgRef"
                                        :src="pngUrl"
                                        alt="Pathway visualization"
                                        style="display: block; max-width: none;"
                                        @load="onImageLoad"
                                    />
                                    <pathway-image-overlay
                                        v-if="imageLoaded"
                                        ref="overlayRef"
                                        :areas="coloredAreas"
                                        :scale="1"
                                        :ec-mapping="mappingStore.ecMapping"
                                        :compound-mapping="mappingStore.compoundMapping"
                                        :style="{ width: imgWidth + 'px', height: imgHeight + 'px' }"
                                        @click:area="onAreaClick"
                                        @click:compound="onCompoundClick"
                                    />
                                </div>
                            </pathway-interactive-image>

                            <!-- Legend overlay (top-right of the image area) -->
                            <div class="legend-overlay">
                                <template v-if="showDifferential">
                                    <div class="d-flex flex-column align-center ga-1">
                                        <span class="text-caption font-weight-medium" :style="{ color: groupColors[0] }">{{ effectiveGroups[0].name }}</span>
                                        <div
                                            class="differential-gradient"
                                            :style="{ background: `linear-gradient(to bottom, ${groupColors[0]}, #ffffe0, ${groupColors[1]})` }"
                                        ></div>
                                        <span class="text-caption font-weight-medium" :style="{ color: groupColors[1] }">{{ effectiveGroups[1].name }}</span>
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="d-flex flex-column ga-1">
                                        <div v-for="item in legendItems" :key="item.label" class="d-flex align-center ga-2">
                                            <div class="legend-swatch" :style="{ background: item.color }"></div>
                                            <span class="text-caption">{{ item.label }}</span>
                                        </div>
                                    </div>
                                </template>
                            </div>

                            <!-- Info panel overlay -->
                            <pathway-info-panel
                                v-model="infoPanel"
                                :image-loaded="imageLoaded"
                                :ec-mapping="mappingStore.ecMapping"
                                :compound-mapping="mappingStore.compoundMapping"
                                :get-ec-stats="getGroupEcStats"
                                :get-area-stats="getAreaStats"
                            />
                            </div>

                            <!-- Actions at bottom — only visible when loaded and not fullscreen -->
                            <template v-if="!loadingViz && !isFullscreen">
                                <v-divider />
                                <div class="d-flex pa-2">
                                    <v-btn
                                        variant="tonal"
                                        prepend-icon="mdi-arrow-left"
                                        @click="selectedPathway = undefined"
                                    >
                                        Select a different pathway
                                    </v-btn>
                                </div>
                            </template>
                        </div>
                    </template>
                </visualization-controls>

            <pathway-download-dialog
                v-model="downloadDialogOpen"
                :png-url="pngUrl ?? ''"
                :overlay-el="(overlayRef as any)?.$el ?? null"
                :img-width="imgWidth"
                :img-height="imgHeight"
                :scale="scale"
                :translate="translate"
                :container-width="containerWidth"
                :container-height="containerHeight"
                :legend-entries="legendEntriesForDialog"
                :is-differential="showDifferential"
                :filename="selectedPathway?.name ?? 'pathway'"
            />
        </template>

        <!-- Pathway selection -->
        <div v-else class="pa-4">
            <div class="d-flex align-center mb-4">
                <div class="mr-4">
                    <h2>PathwayPilot</h2>
                    <p class="mb-1">
                        PathwayPilot maps your metaproteomics data onto KEGG metabolic pathways by linking identified
                        peptides to EC numbers. It highlights which pathway nodes are covered by your sample and lets
                        you explore enzyme activity and compound involvement across the metabolic network.
                    </p>
                    <span class="text-subtitle-2">
                        Vande Moortele et al. (2025) MCP
                        <a href="https://www.mcponline.org/article/S1535-9476(25)00016-7/fulltext" target="_blank">
                            doi.org/10.1016/j.mcpro.2025.100916
                        </a>
                    </span>
                </div>
                <img src="../../../../assets/logo/pathwaypilot-logo.svg" style="max-width: 160px; flex-shrink: 0;" />
            </div>

            <p class="text-body-1 mb-4">
                Select a KEGG metabolic pathway to compare EC number coverage across all selected analyses.
                Colors indicate which analyses have matching EC numbers for each pathway area.
            </p>

            <div v-if="loadingMappings" class="d-flex justify-center align-center py-8">
                <v-progress-circular indeterminate color="primary" />
                <span class="ml-4">Loading pathway data...</span>
            </div>

            <v-data-table
                v-else
                v-model:page="page"
                :headers="tableHeaders"
                :items="filteredMergedItems"
                :items-per-page="10"
                :sort-by="[{ key: 'totalCount', order: 'desc' }]"
                must-sort
                density="compact"
                hover
                @click:row="(_event: any, { item }: any) => selectPathway(item)"
            >
                <template #top>
                    <div class="d-flex ga-2 ma-2 align-center">
                        <v-text-field
                            v-model="search"
                            label="Search pathways"
                            prepend-inner-icon="mdi-magnify"
                            variant="outlined"
                            density="compact"
                            clearable
                            hide-details
                            @click:clear="search = ''"
                        />
                        <v-btn
                            :color="activeFilterCount > 0 ? 'primary' : undefined"
                            :variant="activeFilterCount > 0 ? 'tonal' : 'outlined'"
                            density="compact"
                            style="height: 40px; min-width: 40px;"
                            @click="openFilterDialog"
                        >
                            <v-badge
                                v-if="activeFilterCount > 0"
                                :content="activeFilterCount"
                                color="primary"
                                floating
                            >
                                <v-icon>mdi-filter-variant</v-icon>
                            </v-badge>
                            <v-icon v-else>mdi-filter-variant</v-icon>
                        </v-btn>
                    </div>
                </template>

                <template #item.id="{ item }">
                    <span class="font-weight-medium">{{ item.id }}</span>
                </template>

                <template #item.category="{ item }">
                    <div class="d-flex align-center ga-1">
                        <v-icon :color="categoryColor(item.subCategory || item.category)" size="small">mdi-circle-medium</v-icon>
                        <span>{{ item.subCategory || item.category }}</span>
                    </div>
                </template>

                <template #bottom="{ pageCount }">
                    <div v-if="pageCount > 1" class="d-flex justify-center pa-2">
                        <v-pagination
                            v-model="page"
                            :length="pageCount"
                            density="compact"
                        />
                    </div>
                </template>
            </v-data-table>

            <!-- Filter dialog -->
            <v-dialog v-model="filterDialog" max-width="75vw" scrollable>
                <v-card>
                    <v-card-title class="d-flex align-center">
                        Filter pathways
                        <v-spacer />
                        <v-btn icon density="compact" variant="text" @click="filterDialog = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>
                    <v-card-subtitle>
                        {{ previewFilteredCount }} pathway{{ previewFilteredCount === 1 ? '' : 's' }} match current filters
                    </v-card-subtitle>

                    <v-card-text class="pt-4">
                        <div class="d-flex">
                            <!-- Left: EC Numbers -->
                            <div class="pr-4" style="flex: 1; min-width: 0;">
                                <div class="text-subtitle-2 mb-1">EC Numbers</div>
                                <ec-treeview
                                    v-model="draftEcs"
                                    :ec-ids="availableEcIds"
                                />
                            </div>

                            <v-divider vertical class="mx-0" />

                            <!-- Right: Categories + Compounds -->
                            <div class="pl-4" style="flex: 1; min-width: 0;">
                                <div class="text-subtitle-2 mb-2">Categories</div>
                                <v-autocomplete
                                    v-model="draftCategories"
                                    :items="categoryOptions"
                                    item-title="title"
                                    item-value="value"
                                    multiple
                                    chips
                                    closable-chips
                                    clearable
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    placeholder="Search categories..."
                                    @click:clear="draftCategories = []"
                                >
                                    <template #item="{ props: itemProps, item }">
                                        <v-list-item v-bind="itemProps" active-color="primary">
                                            <template #prepend>
                                                <div :style="{ width: '8px', height: '8px', borderRadius: '50%', marginRight: '8px', flexShrink: '0', background: item.raw.color }" />
                                            </template>
                                        </v-list-item>
                                    </template>
                                    <template #chip="{ props: chipProps, item }">
                                        <v-chip v-bind="chipProps" size="small">
                                            <template #prepend>
                                                <div :style="{ width: '8px', height: '8px', borderRadius: '50%', marginRight: '4px', flexShrink: '0', background: item.raw.color }" />
                                            </template>
                                        </v-chip>
                                    </template>
                                </v-autocomplete>

                                <template v-if="compoundOptions.length > 0">
                                    <v-divider class="my-4" />
                                    <div class="text-subtitle-2 mb-2">Compounds</div>
                                    <v-autocomplete
                                        v-model="draftCompounds"
                                        :items="compoundOptions"
                                        item-title="title"
                                        item-value="value"
                                        multiple
                                        chips
                                        closable-chips
                                        clearable
                                        density="compact"
                                        variant="outlined"
                                        hide-details
                                        placeholder="Search compounds..."
                                        @click:clear="draftCompounds = []"
                                    >
                                        <template #item="{ props: itemProps }">
                                            <v-list-item v-bind="itemProps" active-color="primary">
                                                <template #prepend />
                                            </v-list-item>
                                        </template>
                                    </v-autocomplete>
                                </template>
                            </div>
                        </div>
                    </v-card-text>

                    <v-card-actions>
                        <v-btn variant="text" color="error" @click="clearFilters">Clear all</v-btn>
                        <v-spacer />
                        <v-btn variant="tonal" color="primary" @click="applyFilters">Done</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import * as d3 from 'd3';
import { useFullscreen } from '@vueuse/core';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { GroupAnalysisStore } from '@/store/GroupAnalysisStore';
import { AnalysisStatus } from '@/store/AnalysisStatus';
import { PathwayPilotStatus, PathwayItem } from '@/store/PathwayPilotStore';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';
import useAppStateStore from '@/store/AppStateStore';
import { pathwayGroups, groupColors as pathwayGroupColors } from '@/logic/PathwayGroups';
import PathwayInteractiveImage from '@/components/pathway/PathwayInteractiveImage.vue';
import PathwayImageOverlay from '@/components/pathway/PathwayImageOverlay.vue';
import PathwayInfoPanel from '@/components/pathway/PathwayInfoPanel.vue';
import PathwayDownloadDialog from '@/components/pathway/PathwayDownloadDialog.vue';
import VisualizationControls from '@/components/results/taxonomic/VisualizationControls.vue';
import EcTreeview from '@/components/treeview/EcTreeview.vue';

const props = defineProps<{
    analyses: SingleAnalysisStore[];
    groups: GroupAnalysisStore[];
}>();

const ANALYSIS_COLORS = [
    '#4c8cbf', '#e74c3c', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#3498db'
];

const analysisColors = computed(() =>
    props.analyses.map((_, i) => ANALYSIS_COLORS[i % ANALYSIS_COLORS.length])
);

const mappingStore = usePathwayPilotMappingStore();
const appStateStore = useAppStateStore();

// Computed ref so the template can use `selectedPathway` exactly like a local ref,
// while the actual value lives in the persistent AppStateStore.
const selectedPathway = computed({
    get: () => appStateStore.comparativeAnalysisState.selectedComparativePathway,
    set: (v) => { appStateStore.comparativeAnalysisState.selectedComparativePathway = v; }
});

// Settings state
const settingsPanelOpen = ref<string[]>([]);
const useGroups = ref(true);
const showDifferential = ref(false);

const loadingMappings = ref(false);
const page = ref(1);
const search = ref('');
const filterDialog = ref(false);

// Draft state — what the filter dialog shows while editing
const draftEcs = ref<string[]>([]);
const draftCompounds = ref<string[]>([]);
const draftCategories = ref<string[]>([]);

// Applied state — what actually filters the table (only updated on Done)
const appliedEcs = ref<string[]>([]);
const appliedCompounds = ref<string[]>([]);
const appliedCategories = ref<string[]>([]);

const pngUrl = ref<string | undefined>(undefined);
const rawAreas = ref<any[]>([]);
const loadingViz = ref(false);
const vizError = ref(false);
const scale = ref(1);
const translate = ref({ x: 0, y: 0 });
const initialScale = ref(1);

// Info panel state
type InfoPanelData = { type: 'area'; area: any } | { type: 'compound'; compound: any } | null;
const infoPanel = ref<InfoPanelData>(null);

const imgRef = ref<HTMLImageElement | null>(null);
const overlayRef = ref<InstanceType<typeof PathwayImageOverlay> | null>(null);
const vizWrapper = ref<HTMLElement | null>(null);
const imageLoaded = ref(false);
const imgWidth = ref(0);
const imgHeight = ref(0);
const containerHeight = ref(600);
const containerWidth = ref(0);

const downloadDialogOpen = ref(false);

const fullscreenRoot = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen, isFullscreen } = useFullscreen(fullscreenRoot);

// Groups that have at least one of the selected analyses
const effectiveGroups = computed<GroupAnalysisStore[]>(() =>
    props.groups.filter(g =>
        (g.analyses as SingleAnalysisStore[]).some(a => props.analyses.some(pa => pa.id === a.id))
    )
);

// Color per effective group (reuses ANALYSIS_COLORS indexed by position)
const groupColors = computed(() =>
    effectiveGroups.value.map((_, i) => ANALYSIS_COLORS[i % ANALYSIS_COLORS.length])
);

// Differential abundance requires exactly 2 groups with useGroups enabled
const canShowDifferential = computed(() => useGroups.value && effectiveGroups.value.length === 2);

// Reset differential when it can no longer be shown
watch(canShowDifferential, (can) => {
    if (!can) showDifferential.value = false;
});

// Legend items: per-analysis or per-group depending on useGroups
const legendItems = computed(() => {
    if (useGroups.value) {
        return effectiveGroups.value.map((g, i) => ({ label: g.name, color: groupColors.value[i] }));
    }
    return props.analyses.map((a, i) => ({ label: a.name, color: analysisColors.value[i] }));
});

// Legend entries for the download dialog ({ name, color } shape)
const legendEntriesForDialog = computed(() =>
    legendItems.value.map(item => ({ name: item.label, color: item.color }))
);

// Returns selected analyses that belong to the given group
const analysesForGroup = (group: GroupAnalysisStore): SingleAnalysisStore[] =>
    (group.analyses as SingleAnalysisStore[]).filter(a => props.analyses.some(pa => pa.id === a.id));

// Precomputed total spectral counts per group (denominator P per group for differential).
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

// Per-group matched/total stats for the info panel tooltip.
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

// Per-group area-level spectral count stats for the Overview tab.
const getAreaStats = computed(() => {
    if (!useGroups.value || effectiveGroups.value.length === 0) return undefined;
    return (area: any) => effectiveGroups.value.map((group, i) => ({
        name: group.name,
        color: groupColors.value[i],
        count: getGroupCountForArea(analysesForGroup(group), area),
        total: groupTotalCounts.value[i] ?? 0
    }));
});

// Sum of EC spectral counts for a group's analyses over an area's EC numbers
const getGroupCountForArea = (groupAnalyses: SingleAnalysisStore[], area: any): number => {
    const ecIds: string[] = (area?.info?.ecNumbers ?? []).map((ec: any) => ec.id);
    return groupAnalyses.reduce((total, analysis) => {
        return total + ecIds
            .filter(ecId => analysis.pathwayPilotStore.ecs.has(ecId))
            .reduce((s, ecId) => s + analysis.pathwayPilotStore.getEcCount(ecId), 0);
    }, 0);
};

const isSelectable = (area: any): boolean => {
    if (!area?.info) return false;
    return (area.info.ecNumbers?.length ?? 0)
         + (area.info.koNumbers?.length ?? 0)
         + (area.info.compounds?.length ?? 0)
         + (area.info.reactions?.length ?? 0) > 0;
};

const coloredAreas = computed(() => {
    if (useGroups.value && showDifferential.value && effectiveGroups.value.length === 2) {
        const group1Analyses = analysesForGroup(effectiveGroups.value[0]);
        const group2Analyses = analysesForGroup(effectiveGroups.value[1]);
        const p1 = groupTotalCounts.value[0] ?? 0;
        const p2 = groupTotalCounts.value[1] ?? 0;

        if (p1 === 0 || p2 === 0) {
            return rawAreas.value.map(area => ({ ...area, colors: [] }));
        }

        let min = 0, max = 0;
        const withValues = rawAreas.value.map(area => {
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
        // --- Group mode: color by which groups have matching ECs ---
        return rawAreas.value.map(area => {
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

    // --- Per-analysis mode (default) ---
    return rawAreas.value.map(area => {
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

const tableHeaders = [
    { title: 'ID', key: 'id', sortable: true, width: '110px' },
    { title: 'Category', key: 'category', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Total count', key: 'totalCount', sortable: true, align: 'end' as const }
];

interface MergedPathwayItem extends PathwayItem {
    totalCount: number;
    matchingAnalyses: SingleAnalysisStore[];
}

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

const availableEcIds = computed(() => {
    const ecSet = new Set<string>();
    for (const analysis of props.analyses) {
        for (const ec of analysis.pathwayPilotStore.ecs) {
            ecSet.add(ec);
        }
    }
    return Array.from(ecSet).sort();
});

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

const categoryOptions = computed(() =>
    [...new Set(mergedPathwayItems.value.map(item => item.subCategory || item.category))]
        .sort((a, b) => {
            const iA = pathwayGroups.indexOf(a), iB = pathwayGroups.indexOf(b);
            if (iA >= 0 && iB >= 0) return iA - iB;
            return iA >= 0 ? -1 : iB >= 0 ? 1 : a.localeCompare(b);
        })
        .map(name => ({ value: name, title: name, color: categoryColor(name) }))
);

const activeFilterCount = computed(() =>
    appliedEcs.value.length + appliedCompounds.value.length + appliedCategories.value.length
);

const filterMergedItems = (items: MergedPathwayItem[], ecs: string[], compounds: string[], categories: string[]): MergedPathwayItem[] => {
    if (ecs.length > 0) {
        const allowed = new Set<string>();
        for (const ec of ecs) {
            if (ec.endsWith('.-')) {
                // Intermediate pattern — expand by prefix matching against store ECs
                const prefix = ec.replace(/(\.-)+$/, '');
                for (const analysis of props.analyses) {
                    for (const storeEc of analysis.pathwayPilotStore.ecs) {
                        if (storeEc.startsWith(prefix + '.') || storeEc === prefix) {
                            for (const p of analysis.pathwayPilotStore.pathwaysForEc(storeEc)) allowed.add(p);
                        }
                    }
                }
            } else {
                for (const analysis of props.analyses) {
                    for (const p of analysis.pathwayPilotStore.pathwaysForEc(ec)) allowed.add(p);
                }
            }
        }
        items = items.filter(item => allowed.has(item.id));
    }
    if (compounds.length > 0) {
        const allowed = new Set<string>();
        for (const c of compounds) for (const analysis of props.analyses) for (const p of analysis.pathwayPilotStore.pathwaysForCompound(c)) allowed.add(p);
        items = items.filter(item => allowed.has(item.id));
    }
    if (categories.length > 0) {
        const catSet = new Set(categories);
        items = items.filter(item => catSet.has(item.subCategory || item.category));
    }
    return items;
};

const previewFilteredCount = computed(() =>
    filterMergedItems(mergedPathwayItems.value, draftEcs.value, draftCompounds.value, draftCategories.value).length
);

const openFilterDialog = () => {
    draftEcs.value = [...appliedEcs.value];
    draftCompounds.value = [...appliedCompounds.value];
    draftCategories.value = [...appliedCategories.value];
    filterDialog.value = true;
};

const applyFilters = () => {
    appliedEcs.value = [...draftEcs.value];
    appliedCompounds.value = [...draftCompounds.value];
    appliedCategories.value = [...draftCategories.value];
    filterDialog.value = false;
};

const clearFilters = () => {
    draftEcs.value = [];
    draftCompounds.value = [];
    draftCategories.value = [];
};

const filteredMergedItems = computed(() => {
    let items = filterMergedItems(mergedPathwayItems.value, appliedEcs.value, appliedCompounds.value, appliedCategories.value);
    if (search.value) {
        const q = search.value.toLowerCase();
        items = items.filter(item =>
            item.id.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q) ||
            (item.category || '').toLowerCase().includes(q) ||
            (item.subCategory || '').toLowerCase().includes(q)
        );
    }
    return items;
});

const categoryColor = (subCategory: string): string => {
    const idx = pathwayGroups.indexOf(subCategory);
    return idx >= 0 ? pathwayGroupColors[idx].toString() : '#888888';
};

const onAreaClick = (area: any) => {
    infoPanel.value = area ? { type: 'area', area } : null;
};

const onCompoundClick = (compound: any) => {
    infoPanel.value = compound ? { type: 'compound', compound } : null;
};

const onImageLoad = async () => {
    if (imgRef.value) {
        imgWidth.value = imgRef.value.naturalWidth;
        imgHeight.value = imgRef.value.naturalHeight;
        containerHeight.value = Math.min(imgRef.value.naturalHeight, 600);
        imageLoaded.value = true;

        // Scale so the image width matches the container width (only scale down, never up)
        await nextTick();
        if (vizWrapper.value && imgWidth.value > 0) {
            const containerW = vizWrapper.value.clientWidth;
            containerWidth.value = containerW;
            initialScale.value = imgWidth.value > containerW ? containerW / imgWidth.value : 1;
            scale.value = initialScale.value;
        }
    }
};

const fetchViz = async (pathwayId: string) => {
    loadingViz.value = true;
    vizError.value = false;
    imageLoaded.value = false;
    pngUrl.value = undefined;
    rawAreas.value = [];
    scale.value = 1;
    translate.value = { x: 0, y: 0 };
    infoPanel.value = null;

    try {
        const data = await mappingStore.getVisualizationData(pathwayId);
        pngUrl.value = data.image;
        rawAreas.value = data.nodes ?? [];
    } catch {
        vizError.value = true;
    } finally {
        loadingViz.value = false;
    }
};

const selectPathway = (item: MergedPathwayItem) => {
    selectedPathway.value = item;
    fetchViz(item.id);
};

const retryViz = () => {
    if (selectedPathway.value) fetchViz(selectedPathway.value.id);
};

const resetView = () => {
    scale.value = initialScale.value;
    translate.value = { x: 0, y: 0 };
};

const ensureInitialized = async () => {
    loadingMappings.value = true;
    try {
        await mappingStore.fetchMappings();

        // Resolve a pathway that was stored during session import.
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
        // Pathway already in store (navigated away and back): refetch viz immediately
        // and initialize analyses in the background.
        fetchViz(selectedPathway.value.id);
        ensureInitialized();
    } else {
        // Normal mount or first mount after session import: wait for initialization
        // so that a pending imported pathway ID is resolved before we check.
        await ensureInitialized();
        const pathway = selectedPathway.value as PathwayItem | undefined;
        if (pathway) {
            fetchViz(pathway.id);
        }
    }
});

watch(() => props.analyses, ensureInitialized);
</script>

<style scoped>
.pathway-wrapper {
    width: 100%;
    background: white;
    position: relative;
}

.legend-overlay {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 6px;
    padding: 8px 10px;
    pointer-events: none;
}

.legend-swatch {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    flex-shrink: 0;
    opacity: 0.8;
}

.differential-gradient {
    width: 14px;
    height: 80px;
    border-radius: 3px;
}
</style>

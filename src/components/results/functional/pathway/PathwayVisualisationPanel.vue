<template>
    <div ref="fullscreenRoot">
        <visualization-controls
            :caption="!loading ? 'Scroll to zoom, drag to pan, click a node to reveal additional information' : undefined"
            :download="!loading && !isFullscreen ? () => downloadDialogOpen = true : undefined"
            :reset="imageLoaded ? resetView : undefined"
            :fullscreen="!loading ? toggleFullscreen : undefined"
        >
            <template #visualization>
                <div
                    :class="{ 'd-flex flex-column': isFullscreen }"
                    :style="{ paddingTop: loading ? 0 : '40px', height: isFullscreen ? '100%' : 'auto' }"
                >
                    <!-- PathwayPilot settings -->
                    <div v-show="!loading" class="mx-4 mt-3 mb-3">
                        <v-expansion-panels color="grey-lighten-4" v-model="settingsPanelOpen">
                            <v-expansion-panel value="settings">
                                <v-expansion-panel-title>
                                    <v-icon class="mr-2">mdi-cog</v-icon>
                                    PathwayPilot settings
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <v-row class="mt-0" no-gutters>
                                        <v-col cols="7" class="pr-4">
                                            <div class="text-subtitle-2 mb-1">
                                                Filter by taxon
                                                <span v-if="selectedTreeviewItems.length > 0" class="text-caption font-weight-regular text-medium-emphasis">
                                                    ({{ selectedTreeviewItems.length }}/{{ MAX_TAXA }} selected)
                                                </span>
                                            </div>
                                            <div class="text-caption text-medium-emphasis mb-2">
                                                Restrict pathway highlighting to peptides from selected taxa. Each taxon receives a distinct color on the map. Up to {{ MAX_TAXA }} taxa can be selected simultaneously.
                                            </div>
                                            <taxon-treeview
                                                v-model="selectedTreeviewItems"
                                                :taxon-ids="availableTaxaIds"
                                                :max="MAX_TAXA"
                                            />
                                        </v-col>
                                        <v-divider vertical class="mx-0" />
                                        <v-col cols="4" class="pl-4">
                                            <div class="text-subtitle-2 mb-1">Differential abundance</div>
                                            <div class="text-caption text-medium-emphasis mb-3">
                                                Colors each pathway node by the relative abundance difference between the two selected taxa. Requires exactly 2 taxa selected.
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

                    <template v-if="loading">
                        <v-card-text>
                            <div class="px-4 pt-1 pb-2">
                                <span class="text-h6">{{ store.selectedPathway?.id }}: {{ store.selectedPathway?.name }}</span>
                            </div>
                            <v-progress-linear indeterminate color="primary" />
                            <div class="d-flex justify-center py-6">
                                <span class="text-body-2 text-medium-emphasis">Loading pathway visualization...</span>
                            </div>
                        </v-card-text>
                    </template>

                    <v-alert
                        v-else-if="error"
                        type="error"
                        variant="tonal"
                        class="ma-4"
                    >
                        <div>Failed to load pathway visualization.</div>
                        <v-btn variant="tonal" class="mt-3" prepend-icon="mdi-refresh" @click="loadVisualization">
                            Try again
                        </v-btn>
                    </v-alert>

                    <div
                        v-if="pngUrl && !loading && !error"
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

                        <!-- Legend overlay (top-right, only when taxa are selected) -->
                        <div v-if="selectedTreeviewItems.length > 0" class="legend-overlay">
                            <template v-if="showDifferential && selectedTreeviewItems.length === 2">
                                <div class="d-flex flex-column align-center ga-1">
                                    <span class="text-caption font-weight-medium" :style="{ color: TAXON_COLORS[0] }">{{ selectedTreeviewItems[0].name }}</span>
                                    <div
                                        class="differential-gradient"
                                        :style="{ background: `linear-gradient(to bottom, ${TAXON_COLORS[0]}, #ffffe0, ${TAXON_COLORS[1]})` }"
                                    ></div>
                                    <span class="text-caption font-weight-medium" :style="{ color: TAXON_COLORS[1] }">{{ selectedTreeviewItems[1].name }}</span>
                                </div>
                            </template>
                            <template v-else>
                                <div class="d-flex flex-column ga-1">
                                    <div v-for="(taxon, i) in selectedTreeviewItems" :key="taxon.id" class="d-flex align-center ga-2">
                                        <div class="legend-swatch" :style="{ background: TAXON_COLORS[i] }"></div>
                                        <span class="text-caption">{{ taxon.name }}</span>
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
                            :get-ec-stats="getEcStats"
                            :get-area-stats="getAreaStats"
                        />
                    </div>

                    <!-- Actions at bottom — only visible when pathway is loaded (not while loading or fullscreen) -->
                    <template v-if="!loading && !isFullscreen">
                        <v-divider />
                        <div class="d-flex pa-2">
                            <v-btn
                                variant="tonal"
                                prepend-icon="mdi-arrow-left"
                                @click="emit('back')"
                            >
                                Select a different pathway
                            </v-btn>
                            <v-spacer />
                            <v-menu>
                                <template #activator="{ props: menuProps }">
                                    <v-btn
                                        v-bind="menuProps"
                                        color="primary"
                                        variant="tonal"
                                        prepend-icon="mdi-download"
                                        append-icon="mdi-chevron-down"
                                    >
                                        Export
                                    </v-btn>
                                </template>
                                <v-list density="compact">
                                    <v-list-item density="compact" @click="exportAsCsv(',')">Comma separated (CSV)</v-list-item>
                                    <v-list-item density="compact" @click="exportAsCsv(';')">Semicolon separated (CSV)</v-list-item>
                                    <v-list-item density="compact" @click="exportAsCsv('\t')">Tab separated (TSV)</v-list-item>
                                </v-list>
                            </v-menu>
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
            :legend-entries="legendEntries"
            :is-differential="showDifferential && selectedTreeviewItems.length === 2"
            :filename="store.selectedPathway?.name ?? 'pathway'"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import NcbiTreeNode from '@/logic/ontology/taxonomic/NcbiTreeNode';
import * as d3 from 'd3';
import { useFullscreen } from '@vueuse/core';
import { PathwayPilotStore } from '@/store/PathwayPilotStore';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';
import PathwayInteractiveImage from '@/components/pathway/PathwayInteractiveImage.vue';
import PathwayImageOverlay from '@/components/pathway/PathwayImageOverlay.vue';
import PathwayInfoPanel from '@/components/pathway/PathwayInfoPanel.vue';
import PathwayDownloadDialog from '@/components/pathway/PathwayDownloadDialog.vue';
import VisualizationControls from '@/components/results/taxonomic/VisualizationControls.vue';
import TaxonTreeview from '@/components/treeview/TaxonTreeview.vue';
import { TreeviewItem } from '@/components/visualization/treeview/Treeview.vue';

const MAX_TAXA = 6;
const HIGHLIGHT_COLOR = '#4c8cbf';
const TAXON_COLORS = ['#4c8cbf', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

const props = defineProps<{
    store: PathwayPilotStore;
    analysis: SingleAnalysisStore;
}>();

const emit = defineEmits<{
    back: [];
}>();

const mappingStore = usePathwayPilotMappingStore();

const pngUrl = ref<string | undefined>(undefined);
const areas = ref<any[]>([]);
const loading = ref(false);
const error = ref(false);
const scale = ref(1);
const translate = ref({ x: 0, y: 0 });
const initialScale = ref(1);

const imgRef = ref<HTMLImageElement | null>(null);
const overlayRef = ref<InstanceType<typeof PathwayImageOverlay> | null>(null);
const vizWrapper = ref<HTMLElement | null>(null);
const imageLoaded = ref(false);
const imgWidth = ref(0);
const imgHeight = ref(0);
const containerHeight = ref(500);
const containerWidth = ref(0);

const downloadDialogOpen = ref(false);

// Info panel state
type InfoPanelData = { type: 'area'; area: any } | { type: 'compound'; compound: any } | null;
const infoPanel = ref<InfoPanelData>(null);

// Settings state
const settingsPanelOpen = ref<string[]>([]);
const selectedTreeviewItems = ref<TreeviewItem[]>([]);
const showDifferential = ref(false);

const fullscreenRoot = ref<HTMLElement | null>(null);
const { toggle: toggleFullscreen, isFullscreen } = useFullscreen(fullscreenRoot);

const canShowDifferential = computed(() => selectedTreeviewItems.value.length === 2);

const legendEntries = computed(() =>
    selectedTreeviewItems.value.map((t, i) => ({ name: t.name, color: TAXON_COLORS[i] }))
);

const totalSpectralCount = computed(() => {
    if (!props.analysis.peptidesTable) return 0;
    let total = 0;
    for (const [, count] of props.analysis.peptidesTable.counts.entries()) {
        total += count;
    }
    return total;
});

watch(canShowDifferential, (can) => {
    if (!can) showDifferential.value = false;
});

// All taxon IDs contributing to any EC in the current pathway's areas
const availableTaxaIds = computed<number[]>(() => {
    if (!areas.value.length || !props.analysis.ecToPeptides || !props.analysis.peptideToLca) return [];

    const taxaSet = new Set<number>();
    for (const area of areas.value) {
        for (const ec of (area.info?.ecNumbers ?? [])) {
            const peptides = props.analysis.ecToPeptides.get('EC:' + ec.id) ?? [];
            for (const peptide of peptides) {
                const taxonId = props.analysis.peptideToLca.get(peptide);
                if (taxonId != null) taxaSet.add(taxonId);
            }
        }
    }

    return Array.from(taxaSet);
});

// For each selected taxon, collect all peptides from that taxon AND all its
// descendants in the NCBI tree (mirrors updateTaxonomicFilter in SingleAnalysisStore).
// Computed once per selection change, not once per area.
const taxonPeptideSets = computed<Map<number, Set<string>>>(() => {
    const result = new Map<number, Set<string>>();
    if (!props.analysis.lcaToPeptides || !props.analysis.ncbiTreeNodes) return result;

    for (const taxon of selectedTreeviewItems.value) {
        const peptides = new Set<string>();
        const stack: NcbiTreeNode[] = [];
        const startNode = props.analysis.ncbiTreeNodes.get(taxon.id);
        if (startNode) stack.push(startNode);

        while (stack.length > 0) {
            const node = stack.pop()!;
            for (const peptide of (props.analysis.lcaToPeptides.get(node.id) ?? [])) {
                peptides.add(peptide);
            }
            for (const child of node.children) {
                stack.push(child);
            }
        }

        result.set(taxon.id, peptides);
    }
    return result;
});

// Total spectral count of ALL peptides in the taxon (denominator P for differential).
const taxonTotalCount = (taxonId: number): number => {
    if (!props.analysis.peptidesTable) return 0;
    const taxonSet = taxonPeptideSets.value.get(taxonId);
    if (!taxonSet) return 0;
    let total = 0;
    for (const p of taxonSet) {
        total += props.analysis.peptidesTable.counts.get(p) ?? 1;
    }
    return total;
};

// Spectral count of matched peptides for a specific EC in a taxon (used by tooltip).
const getMatchedCountForEc = (taxonId: number, ecId: string): number => {
    if (!props.analysis.ecToPeptides || !props.analysis.peptidesTable) return 0;
    const taxonSet = taxonPeptideSets.value.get(taxonId);
    if (!taxonSet) return 0;
    return (props.analysis.ecToPeptides.get('EC:' + ecId) ?? [])
        .filter(p => taxonSet.has(p))
        .reduce((s, p) => s + (props.analysis.peptidesTable!.counts.get(p) ?? 1), 0);
};

// Per-taxon matched/total stats for the info panel tooltip.
// Falls back to whole-sample entry when no taxa selected.
const getEcStats = computed(() => {
    if (selectedTreeviewItems.value.length === 0) {
        return (ecId: string) => [{
            name: props.analysis.name,
            color: HIGHLIGHT_COLOR,
            matched: props.store.getEcCount(ecId),
            total: totalSpectralCount.value
        }];
    }
    return (ecId: string) => selectedTreeviewItems.value.map((taxon, i) => ({
        name: taxon.name,
        color: TAXON_COLORS[i],
        matched: getMatchedCountForEc(taxon.id, ecId),
        total: taxonTotalCount(taxon.id)
    }));
});

// Per-taxon area-level spectral count stats for the Overview tab.
// Falls back to whole-sample entry when no taxa selected.
const getAreaStats = computed(() => {
    if (selectedTreeviewItems.value.length === 0) {
        return (area: any) => [{
            name: props.analysis.name,
            color: HIGHLIGHT_COLOR,
            count: (area?.info?.ecNumbers ?? []).reduce((sum: number, ec: any) => sum + props.store.getEcCount(ec.id), 0),
            total: totalSpectralCount.value
        }];
    }
    return (area: any) => selectedTreeviewItems.value.map((taxon, i) => ({
        name: taxon.name,
        color: TAXON_COLORS[i],
        count: getTaxonCountForArea(taxon.id, area),
        total: taxonTotalCount(taxon.id)
    }));
});

// Spectral count for a taxon across all ECs in a pathway area.
// Mirrors getGroupCountForArea in ComparativePathwayPilot:
//   - only ECs present in this sample (store.ecs) are counted
//   - spectral count is the taxon-filtered subset of getEcCount (peptides belonging
//     to this taxon that also carry that EC, summed by peptidesTable spectral count)
const getTaxonCountForArea = (taxonId: number, area: any): number => {
    if (!props.analysis.ecToPeptides || !props.analysis.peptidesTable) return 0;

    const taxonPeptideSet = taxonPeptideSets.value.get(taxonId);
    if (!taxonPeptideSet || taxonPeptideSet.size === 0) return 0;

    const ecIds: string[] = (area?.info?.ecNumbers ?? []).map((ec: any) => ec.id);
    return ecIds
        .filter(ecId => props.store.ecs.has(ecId))
        .reduce((total, ecId) => {
            const count = (props.analysis.ecToPeptides!.get('EC:' + ecId) ?? [])
                .filter(p => taxonPeptideSet.has(p))
                .reduce((s, p) => s + (props.analysis.peptidesTable!.counts.get(p) ?? 1), 0);
            return total + count;
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
    if (selectedTreeviewItems.value.length === 0) {
        // Default: single highlight color for all matched EC areas
        const ecs = props.store.ecs;
        return areas.value.map(area => ({
            ...area,
            colors: (isSelectable(area) && area?.info?.ecNumbers?.some((ec: any) => ecs.has(ec.id ?? ec)))
                ? [HIGHLIGHT_COLOR]
                : []
        }));
    }

    if (showDifferential.value && selectedTreeviewItems.value.length === 2) {
        const taxon1 = selectedTreeviewItems.value[0];
        const taxon2 = selectedTreeviewItems.value[1];
        const p1 = taxonTotalCount(taxon1.id);
        const p2 = taxonTotalCount(taxon2.id);

        if (p1 === 0 || p2 === 0) {
            return areas.value.map(area => ({ ...area, colors: [] }));
        }

        let min = 0, max = 0;
        const withValues = areas.value.map(area => {
            if (!isSelectable(area)) return { area, value: null as number | null };
            const x = getTaxonCountForArea(taxon1.id, area);
            const y = getTaxonCountForArea(taxon2.id, area);
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
            d3.interpolateRgbBasis([TAXON_COLORS[0], '#ffffe0', TAXON_COLORS[1]])
        );
        return withValues.map(({ area, value }) => ({
            ...area,
            colors: value !== null ? [colorScale(value)] : []
        }));
    }

    // Per-taxon mode: color by which selected taxa are present
    return areas.value.map(area => {
        if (!isSelectable(area)) return { ...area, colors: [] };
        const colors: string[] = [];
        for (let i = 0; i < selectedTreeviewItems.value.length; i++) {
            if (getTaxonCountForArea(selectedTreeviewItems.value[i].id, area) > 0) {
                colors.push(TAXON_COLORS[i]);
            }
        }
        return { ...area, colors };
    });
});

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

        await nextTick();
        if (vizWrapper.value && imgWidth.value > 0) {
            const containerW = vizWrapper.value.clientWidth;
            containerWidth.value = containerW;
            initialScale.value = imgWidth.value > containerW ? containerW / imgWidth.value : 1;
            scale.value = initialScale.value;
        }
    }
};

const resetView = () => {
    scale.value = initialScale.value;
    translate.value = { x: 0, y: 0 };
};

const loadVisualization = async () => {
    if (!props.store.selectedPathway) return;

    loading.value = true;
    error.value = false;
    imageLoaded.value = false;
    pngUrl.value = undefined;
    areas.value = [];
    scale.value = 1;
    translate.value = { x: 0, y: 0 };
    infoPanel.value = null;
    selectedTreeviewItems.value = [];
    showDifferential.value = false;

    try {
        const data = await mappingStore.getVisualizationData(props.store.selectedPathway!.id);
        if (data) {
            pngUrl.value = data.image;
            areas.value = data.nodes ?? [];
        }
    } catch {
        error.value = true;
    } finally {
        loading.value = false;
    }
};

const exportAsCsv = (delimiter: string) => {
    if (!props.analysis.peptidesTable || !props.analysis.ecToPeptides) return;

    // Build peptide → EC IDs map (strip "EC:" prefix to match store format)
    const peptideToEcs = new Map<string, string[]>();
    for (const [rawEc, peptides] of props.analysis.ecToPeptides.entries()) {
        const ecId = rawEc.startsWith('EC:') ? rawEc.substring(3) : rawEc;
        for (const peptide of peptides) {
            if (!peptideToEcs.has(peptide)) peptideToEcs.set(peptide, []);
            peptideToEcs.get(peptide)!.push(ecId);
        }
    }

    const escapeCell = (cell: string): string => {
        if (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n')) {
            return '"' + cell.replace(/"/g, '""') + '"';
        }
        return cell;
    };

    const header = ['peptide', 'peptide_count', 'taxon_id', 'taxon_rank', 'taxon_name', 'pathways', 'pathway_names'];
    const lines: string[] = [header.join(delimiter)];

    for (const [peptide, count] of props.analysis.peptidesTable.counts.entries()) {
        const taxonId = props.analysis.peptideToLca?.get(peptide);
        const taxonNode = taxonId != null ? props.analysis.ncbiTreeNodes?.get(taxonId) : undefined;

        const ecIds = peptideToEcs.get(peptide) ?? [];
        const pathwayIdSet = new Set<string>();
        for (const ec of ecIds) {
            for (const p of props.store.pathwaysForEc(ec)) {
                pathwayIdSet.add(p);
            }
        }

        const sortedPathways = Array.from(pathwayIdSet).sort();
        const pathwayNames = sortedPathways.map(id => mappingStore.pathwayMapping?.get(id)?.name ?? '').join(';');

        const rank = taxonNode?.extra?.rank ?? 'no rank';
        const name = rank === 'no rank' ? 'root' : (taxonNode?.name ?? '');

        lines.push([
            escapeCell(peptide),
            String(count),
            taxonId != null ? String(taxonId) : '',
            escapeCell(rank),
            escapeCell(name),
            escapeCell(sortedPathways.join(';')),
            escapeCell(pathwayNames),
        ].join(delimiter));
    }

    const content = lines.join('\n');
    const extension = delimiter === '\t' ? 'tsv' : 'csv';
    const mimeType = delimiter === '\t' ? 'text/tab-separated-values' : 'text/csv';
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.store.selectedPathway?.name ?? 'pathway'}_export.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
};

watch(() => props.store.selectedPathway, () => {
    loadVisualization();
});

onMounted(() => {
    if (props.store.selectedPathway) {
        loadVisualization();
    }
});
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

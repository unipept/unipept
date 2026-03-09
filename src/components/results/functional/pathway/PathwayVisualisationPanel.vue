<template>
    <pathway-visualization-viewer
        :viz="viz"
        :colored-areas="coloredAreas"
        :selected-pathway="props.store.selectedPathway"
        :legend-items="legendItems"
        :legend-visible="selectedTreeviewItems.length > 0"
        :show-differential="showDifferential && selectedTreeviewItems.length === 2"
        :differential-labels="selectedTreeviewItems.length === 2 ? [selectedTreeviewItems[0].name, selectedTreeviewItems[1].name] : undefined"
        :differential-colors="selectedTreeviewItems.length === 2 ? [PATHWAY_COLORS[0], PATHWAY_COLORS[1]] : undefined"
        :get-ec-stats="getEcStats"
        :get-area-stats="getAreaStats"
        :show-csv-export="true"
        :crowding-warning="selectedTreeviewItems.length > 6"
        @back="emit('back')"
        @export-csv="exportAsCsv"
        @retry="loadVisualization"
    >
        <template #settings>
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
        </template>
    </pathway-visualization-viewer>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import * as d3 from 'd3';
import { PathwayPilotStore } from '@/store/PathwayPilotStore';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { PATHWAY_COLORS, isSelectable } from '@/composables/pathway/usePathwayColors';
import { usePathwayVisualization } from '@/composables/pathway/usePathwayVisualization';
import NcbiTreeNode from '@/logic/ontology/taxonomic/NcbiTreeNode';
import PathwayVisualizationViewer from '@/components/pathway/PathwayVisualizationViewer.vue';
import TaxonTreeview from '@/components/treeview/TaxonTreeview.vue';
import { TreeviewItem } from '@/components/visualization/treeview/Treeview.vue';

const MAX_TAXA = 6;
const HIGHLIGHT_COLOR = '#4c8cbf';

const props = defineProps<{
    store: PathwayPilotStore;
    analysis: SingleAnalysisStore;
}>();

const emit = defineEmits<{
    back: [];
}>();

const viz = usePathwayVisualization();

const selectedTreeviewItems = ref<TreeviewItem[]>([]);
const showDifferential = ref(false);

const canShowDifferential = computed(() => selectedTreeviewItems.value.length === 2);

const legendItems = computed(() =>
    selectedTreeviewItems.value.map((t, i) => ({ label: t.name, color: PATHWAY_COLORS[i] }))
);

watch(canShowDifferential, (can) => {
    if (!can) showDifferential.value = false;
});

const totalSpectralCount = computed(() => {
    if (!props.analysis.peptidesTable) return 0;
    let total = 0;
    for (const [, count] of props.analysis.peptidesTable.counts.entries()) {
        total += count;
    }
    return total;
});

const availableTaxaIds = computed<number[]>(() => {
    if (!viz.rawAreas.value.length || !props.analysis.ecToPeptides || !props.analysis.peptideToLca) return [];

    const taxaSet = new Set<number>();
    for (const area of viz.rawAreas.value) {
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

const getMatchedCountForEc = (taxonId: number, ecId: string): number => {
    if (!props.analysis.ecToPeptides || !props.analysis.peptidesTable) return 0;
    const taxonSet = taxonPeptideSets.value.get(taxonId);
    if (!taxonSet) return 0;
    return (props.analysis.ecToPeptides.get('EC:' + ecId) ?? [])
        .filter(p => taxonSet.has(p))
        .reduce((s, p) => s + (props.analysis.peptidesTable!.counts.get(p) ?? 1), 0);
};

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
        color: PATHWAY_COLORS[i],
        matched: getMatchedCountForEc(taxon.id, ecId),
        total: taxonTotalCount(taxon.id)
    }));
});

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
        color: PATHWAY_COLORS[i],
        count: getTaxonCountForArea(taxon.id, area),
        total: taxonTotalCount(taxon.id)
    }));
});

const coloredAreas = computed(() => {
    if (selectedTreeviewItems.value.length === 0) {
        const ecs = props.store.ecs;
        return viz.rawAreas.value.map(area => ({
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
            return viz.rawAreas.value.map(area => ({ ...area, colors: [] }));
        }

        let min = 0, max = 0;
        const withValues = viz.rawAreas.value.map(area => {
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
            d3.interpolateRgbBasis([PATHWAY_COLORS[0], '#ffffe0', PATHWAY_COLORS[1]])
        );
        return withValues.map(({ area, value }) => ({
            ...area,
            colors: value !== null ? [colorScale(value)] : []
        }));
    }

    return viz.rawAreas.value.map(area => {
        if (!isSelectable(area)) return { ...area, colors: [] };
        const colors: string[] = [];
        for (let i = 0; i < selectedTreeviewItems.value.length; i++) {
            if (getTaxonCountForArea(selectedTreeviewItems.value[i].id, area) > 0) {
                colors.push(PATHWAY_COLORS[i]);
            }
        }
        return { ...area, colors };
    });
});

const exportAsCsv = (delimiter: string) => {
    if (!props.analysis.peptidesTable || !props.analysis.ecToPeptides) return;

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
        const pathwayNames = sortedPathways.map(id => viz.mappingStore.pathwayMapping?.get(id)?.name ?? '').join(';');

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
    a.download = `pathwaypilot_export.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
};

const loadVisualization = async () => {
    if (!props.store.selectedPathway) return;
    selectedTreeviewItems.value = [];
    showDifferential.value = false;
    await viz.fetchVisualization(props.store.selectedPathway.id);
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

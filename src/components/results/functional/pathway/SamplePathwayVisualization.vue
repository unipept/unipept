<template>
    <pathway-visualization-viewer
        :viz="viz"
        :colored-areas="coloredAreas"
        :selected-pathway="props.store.selectedPathway"
        :legend-items="legendItems"
        :show-differential="showDifferential && canShowDifferential"
        :differential-labels="differentialLabels"
        :differential-colors="differentialColors"
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
import { PathwayPilotStore } from '@/store/PathwayPilotStore';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { PATHWAY_COLORS } from '@/composables/pathway/usePathwayColors';
import { usePathwayLegend } from '@/composables/pathway/usePathwayLegend';
import { usePathwayVisualization } from '@/composables/pathway/usePathwayVisualization';
import { usePathwayCsvExport } from '@/composables/pathway/usePathwayCsvExport';
import { usePathwayColoring } from '@/composables/pathway/usePathwayColoring';
import type { ColoringItem } from '@/composables/pathway/usePathwayColoring';
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
const { exportSingleAnalysis } = usePathwayCsvExport();

const selectedTreeviewItems = ref<TreeviewItem[]>([]);

const { legendItems, showDifferential, canShowDifferential, differentialLabels, differentialColors } = usePathwayLegend({
    items: () =>
        selectedTreeviewItems.value.length > 0
            ? selectedTreeviewItems.value.map(t => ({ label: t.name }))
            : [{ label: props.analysis.name }],
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
        total += props.analysis.peptidesTable.getOrDefault(p);
    }
    return total;
};

const getMatchedCountForEc = (taxonId: number, ecId: string): number => {
    if (!props.analysis.ecToPeptides || !props.analysis.peptidesTable) return 0;
    const taxonSet = taxonPeptideSets.value.get(taxonId);
    if (!taxonSet) return 0;
    return (props.analysis.ecToPeptides.get('EC:' + ecId) ?? [])
        .filter(p => taxonSet.has(p))
        .reduce((s, p) => s + props.analysis.peptidesTable!.getOrDefault(p), 0);
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
                .reduce((s, p) => s + props.analysis.peptidesTable!.getOrDefault(p), 0);
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

const coloringItems = computed<ColoringItem[]>(() =>
    selectedTreeviewItems.value.map((taxon, i) => ({
        color: legendItems.value[i].color,
        hasMatch: (area: any) => getTaxonCountForArea(taxon.id, area) > 0,
        countForArea: (area: any) => getTaxonCountForArea(taxon.id, area),
        total: taxonTotalCount(taxon.id),
    }))
);

const { coloredAreas } = usePathwayColoring({
    rawAreas: viz.rawAreas,
    showDifferential,
    canShowDifferential,
    items: coloringItems,
    defaultColoring: (area: any) => {
        const ecs = props.store.ecs;
        return (area?.info?.ecNumbers?.some((ec: any) => ecs.has(ec.id ?? ec)))
            ? [HIGHLIGHT_COLOR]
            : [];
    },
});

const exportAsCsv = (delimiter: string) => exportSingleAnalysis(props.analysis, delimiter);

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

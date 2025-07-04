<template>
    <div>
        <visualization-controls
            caption="Hover over the cells to see more details"
            :settings="true"
            :download="() => downloadImageModalOpen = true"
        >
            <template #settings>
                <v-list-item>
                    Heatmap settings
                </v-list-item>
                <v-list-item>
                    <v-select
                        label="Rank"
                        density="comfortable"
                        variant="underlined"
                        :items="taxonomicRankOptions"
                        v-model="selectedTaxonomicRank"
                        hide-details
                    />
                </v-list-item>
                <v-list-item class="mb-n2">
                    <v-checkbox
                        v-model="useAbsoluteValues"
                        label="Use absolute peptide counts"
                        color="primary"
                        density="compact"
                        hide-details
                    />
                </v-list-item>
                <v-list-item style="height: 36px;">
                    <v-checkbox
                        v-model="rescaleHeatmapColors"
                        label="Rescale colors?"
                        color="primary"
                        density="compact"
                        hide-details
                    />
                </v-list-item>
            </template>

            <template #visualization>
                <div style="padding-top: 50px;" class="ma-0 d-flex ga-8">
                    <div>
                        <div ref="heatmapWrapper" class="mx-4 mb-4">
                            <heatmap
                                :data="rescaledRows"
                                :row-names="rowNames"
                                :col-names="colNames"
                                @deselect-row="removeRow"
                            >
                                <template #tooltip-content="{ selectedRow, selectedCol }">
                                    <template v-if="selectedCol !== -1 && selectedRow !== -1">
                                        <div class="text-subtitle-1">{{ analyses[selectedCol].name }} • {{ rowNames[selectedRow] }}</div>
                                        <div>
                                            <span class="font-weight-bold">Absolute peptide count:</span> {{ getFeatureItem(selectedRow, selectedCol)?.peptideCount || 0 }} peptides
                                        </div>
                                        <div>
                                            <span class="font-weight-bold">Relative abundance:</span> {{ ((getFeatureItem(selectedRow, selectedCol)?.relativeAbundance || 0) * 100).toFixed(2) }}%
                                        </div>
                                    </template>
                                </template>
                                <template #row-selector>
                                    <v-unipept-card style="width: 800px;" elevation="10">
                                        <v-card-title>
                                            <div class="text-h5">Add {{ selectedTaxonomicRank }}</div>
                                        </v-card-title>
                                        <v-card-text style="padding-top: 4px !important;">
                                            <v-text-field
                                                v-model="featureSearchValue"
                                                density="compact"
                                                append-inner-icon="mdi-magnify"
                                                label="Search"
                                                variant="outlined"
                                                @click.stop
                                            />
                                            <v-data-table
                                                :items="[...featureSummaries.values()]"
                                                :headers="featureTableHeaders"
                                                :sort-by="sortByItems"
                                                multi-sort
                                                :items-per-page="currentItemsPerPage"
                                                :items-per-page-options="[5, 10, -1]"
                                                density="compact"
                                                :custom-key-sort="{
                                                    'matchingSamples': customMatchingSamplesSort
                                                }"
                                                :page="currentTablePage"
                                                @update:current-items="updateVisibleItems"
                                            >
                                                <template #item.matchingSamples="{ item }">
                                                    {{ item.matchingSamples.length }}
                                                </template>
                                                <template #item.averageRelativeAbundance="{ item }">
                                                    {{ (item.averageRelativeAbundance * 100).toFixed(2) }}%
                                                </template>
                                                <template #header.action>
                                                    <v-tooltip v-if="allInPageSelected">
                                                        <template v-slot:activator="{ props }">
                                                            <v-btn
                                                                style="width: 120px;"
                                                                color="error"
                                                                density="compact"
                                                                variant="tonal"
                                                                prepend-icon="mdi-minus"
                                                                text="Drop all"
                                                                v-bind="props"
                                                                @click="removeRows(visibleItems)"
                                                            />
                                                        </template>
                                                        <span>Drop all items from the heatmap</span>
                                                    </v-tooltip>
                                                    <v-tooltip v-else>
                                                        <template v-slot:activator="{ props }">
                                                            <v-btn
                                                                style="width: 120px;"
                                                                color="primary"
                                                                density="compact"
                                                                variant="tonal"
                                                                prepend-icon="mdi-plus"
                                                                text="Add all"
                                                                v-bind="props"
                                                                @click="addRows(visibleItems)"
                                                            />
                                                        </template>
                                                        <span>Add all items to the heatmap</span>
                                                    </v-tooltip>
                                                </template>
                                                <template #item.action="{ item }">
                                                    <v-tooltip v-if="rowNames.includes(item.name)">
                                                        <template v-slot:activator="{ props }">
                                                            <v-btn
                                                                style="width: 120px;"
                                                                color="error"
                                                                density="compact"
                                                                variant="tonal"
                                                                prepend-icon="mdi-minus"
                                                                text="Drop"
                                                                @click="removeRow(rowNames.indexOf(item.name))"
                                                                v-bind="props"
                                                            />
                                                        </template>
                                                        <span>Remove item from the heatmap</span>
                                                    </v-tooltip>
                                                    <v-tooltip v-else>
                                                        <template v-slot:activator="{ props }">
                                                            <v-btn
                                                                style="width: 120px;"
                                                                color="primary"
                                                                density="compact"
                                                                variant="tonal"
                                                                prepend-icon="mdi-plus"
                                                                text="Add"
                                                                @click="addRow(item)"
                                                                v-bind="props"
                                                            />
                                                        </template>
                                                        <span>Add item to the heatmap</span>
                                                    </v-tooltip>
                                                </template>

                                            </v-data-table>
                                        </v-card-text>
                                    </v-unipept-card>
                                </template>
                            </heatmap>
                        </div>
                    </div>
                    <v-divider vertical class="mb-2"/>
                    <div class="flex-grow-1">
<!--                        <div class="text-h5 mt-2">Cell details</div>-->
                        <v-empty-state
                            icon="mdi-cursor-default-click"
                            color="grey-lighten-1"
                            title="No cell selected"
                            text="Select a cell from the heatmap on the left to get a detailed information overview."
                        />
                    </div>
                </div>
            </template>
        </visualization-controls>
    </div>

    <download-image
        v-if="svg"
        v-model="downloadImageModalOpen"
        :image="svg"
        filename="heatmap"
    />
</template>

<script setup lang="ts">
import VisualizationControls from "@/components/results/taxonomic/VisualizationControls.vue";
import {computed, ComputedRef, nextTick, onMounted, Ref, ref, watch} from "vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import DownloadImage from "@/components/image/DownloadImage.vue";
import Heatmap from "@/components/visualization/heatmap/Heatmap.vue";
import {NcbiRank, NcbiTaxon} from "@/logic/ontology/taxonomic/Ncbi";
import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import {SortItem} from "vuetify/lib/components/VDataTable/composables/sort";
import {useDebounceFn} from "@vueuse/core";

interface FeatureSummary {
    name: string,
    matchingSamples: string[],
    averageRelativeAbundance: number,
    // Maps analysis ID onto the corresponding feature item
    items: Map<string, FeatureItem<NcbiTaxon>>
}

interface FeatureItem<T> {
    id: number,
    // Absolute count of peptides directly associated to this feature item.
    peptideCount: number,
    // Number between 0 and 1 (both inclusive) that indicates the normalized abundance of this feature item in
    // comparison with all its other items in the same category.
    relativeAbundance: number,
    data: T
}

const useAbsoluteValues = ref(false);
const rescaleHeatmapColors = ref(false);

const downloadImageModalOpen = ref(false);

const heatmapWrapper = ref<HTMLDivElement>();
const svg: Ref<SVGElement | undefined | null> = ref();

const props = defineProps<{
    analyses: SingleAnalysisStore[]
}>();

const taxonomicRankOptions: Ref<string[]> = ref(
    Object.values(NcbiRank)
);

const selectedTaxonomicRank: Ref<string> = ref("species");

const featureSearchValue: Ref<string> = ref("");

const currentTablePage = ref(1);
const currentItemsPerPage = ref(5);

const visibleItems: Ref<FeatureSummary[]> = ref([]);

const updateVisibleItems = (currentItems: any[]) => {
    visibleItems.value = currentItems.map(i => i.raw);
}

/**
 * Returns true if all the items of the currently shown row in the data table are already selected for the heatmap.
 */
const allInPageSelected = computed(() => {
    return visibleItems.value.every(summary => rowNames.value.includes(summary.name));
});

const featureTableHeaders: any = [
    {
        title: "Name",
        align: "start",
        value: "name",
        sortable: true,
        width: "40%"
    }, {
        title: "Matching Samples",
        align: "end",
        value: "matchingSamples",
        sortable: true,
        width: "25%"
    }, {
        title: "Avg. Rel. Abundance",
        align: "end",
        value: "averageRelativeAbundance",
        sortable: true,
        width: "25%"
    }, {
        title: "",
        align: "center",
        sortable: false,
        value: "action",
        width: "10%"
    }
];

const sortByItems: Ref<SortItem[]> = ref([
    {
        key: 'matchingSamples',
        order: 'desc'
    }, {
        key: 'averageRelativeAbundance',
        order: 'desc'
    }
]);

const customMatchingSamplesSort = (a: string[], b: string[]) => {
    const valueA = a.length;
    const valueB = b.length;

    if (valueA === valueB) {
        return 0
    } else {
        return valueA < valueB ? -1 : 1;
    }
};

const rows: Ref<number[][]> = ref([]);

const rescaledRows: ComputedRef<number[][]> = computed(() => {
    if (rescaleHeatmapColors.value) {
        // We should normalize the colors in the heatmap according to the min / max value in the grid
        let minValue = 1;
        let maxValue = 0;

        for (const row of rows.value) {
            minValue = Math.min(minValue, ...row);
            maxValue = Math.max(maxValue, ...row);
        }

        const rescaled: number[][] = [];

        for (const row of rows.value) {
            const rescaledRow: number[] = [];
            for (const value of row) {
                rescaledRow.push((value - minValue) / (maxValue - minValue));
            }
            rescaled.push(rescaledRow);
        }

        return rescaled;
    } else {
        // No rescaling needs to be applied; return the original, raw rows
        return rows.value;
    }
});

const rowNames: Ref<string[]> = ref([]);

// The columns of the heatmap always correspond to the selected analyses
const colNames = computed(() => props.analyses.map(a => a.name));

const featureItems: Ref<Map<string, FeatureItem<NcbiTaxon>[]>> = ref(new Map());
const featureSummaries: Ref<Map<number, FeatureSummary>> = ref(new Map());

const getFeatureItem = (rowIdx: number, colIdx: number): FeatureItem<NcbiTaxon> | undefined => {
    const analysis = props.analyses[colIdx];
    return featureItems.value.get(analysis.id)?.find(item => item.data.name === rowNames.value[rowIdx]);
}

/**
 * This function regenerates all input data for the heatmap and should be called whenever the user selects a different
 * feature source (i.e. changes the rank, ...) or when the user selects a different collection of samples for the
 * comparison.
 */
const initializeData = () => {
    // Recompute the features
    featureItems.value = computeFeatureObjects();
    featureSummaries.value = summarizeFeatures(featureItems.value);

    // Select the top 5 most abundant features for the initial state of the heatmap.
    const topFeatures = [...featureSummaries.value.values()].sort((a, b) => {
        if (b.matchingSamples.length !== a.matchingSamples.length) {
            return b.matchingSamples.length - a.matchingSamples.length;
        }
        return b.averageRelativeAbundance - a.averageRelativeAbundance;
    }).slice(0, 5);

    rows.value = [];
    rowNames.value = [];

    for (const feature of topFeatures) {
        addRow(feature);
    }
};

/**
 * Construct the data objects for the currently selected samples and settings for this comparative heatmap. These
 * objects are structured per analysis (and includes all objects that are actually associated with the selected analysis
 * and the currently configured filters).
 */
const computeFeatureObjects = () => {
    // Maps analysis ID onto a list of its computed feature objects.
    const featuresPerAnalysis: Map<string, FeatureItem<NcbiTaxon>[]> = new Map();

    for (const analysis of props.analyses) {
        const ncbiOntology = analysis.ontologyStore.ncbiOntology;
        const features: FeatureItem<NcbiTaxon>[] = [];

        let totalCount: number = 0;

        analysis.ncbiTree.callRecursivelyPostOrder((x: NcbiTreeNode) => {
            if (x && x.extra.rank === selectedTaxonomicRank.value) {
                const taxonObj = ncbiOntology.get(x.id);

                if (!taxonObj || !taxonObj.name.toLowerCase().includes(featureSearchValue.value.toLowerCase())) {
                    return;
                }

                totalCount += x.count;

                features.push({
                    id: x.id,
                    peptideCount: x.count,
                    // Temporary set this to 0, will be recomputed later when the max peptide count is known.
                    relativeAbundance: 0,
                    data: taxonObj
                });
            }
        });

        // At this point, we actually know the max peptide count and we can actually compute the relative abundance.
        for (const featureItem of features) {
            featureItem.relativeAbundance = featureItem.peptideCount / totalCount;
        }

        featuresPerAnalysis.set(analysis.id, features);
    }

    return featuresPerAnalysis;
}

/**
 *
 * @param featuresPerAnalysis
 */
const summarizeFeatures = (
    featuresPerAnalysis: Map<string, FeatureItem<NcbiTaxon>[]>
): Map<number, FeatureSummary> => {
    const features = new Map<number, FeatureSummary>();

    for (const [analysisId, featureItems] of featuresPerAnalysis) {
        for (const featureItem of featureItems) {
            if (!features.has(featureItem.id)) {
                features.set(featureItem.id, {
                    name: featureItem.data.name,
                    matchingSamples: [analysisId],
                    averageRelativeAbundance: featureItem.relativeAbundance,
                    items: new Map<string, FeatureItem<NcbiTaxon>>([[analysisId, featureItem]])
                });
            } else {
                const featureObj = features.get(featureItem.id)!;
                featureObj.averageRelativeAbundance = ((featureObj.averageRelativeAbundance * featureObj.matchingSamples.length) + featureItem.relativeAbundance) / (featureObj.matchingSamples.length + 1);
                featureObj.matchingSamples.push(analysisId);
                featureObj.items.set(analysisId, featureItem);
            }
        }
    }

    return features;
}

const addRow = (summary: FeatureSummary) => {
    const rowData = [];

    for (const analysis of props.analyses) {
        rowData.push(summary.items.get(analysis.id)?.relativeAbundance || 0);
    }

    rows.value.push(rowData);
    rowNames.value.push(summary.name);
};

const addRows = (rows: FeatureSummary[]) => {
    for (const row of rows) {
        if (!rowNames.value.includes(row.name)) {
            addRow(row);
        }
    }
}

const removeRow = (index: number) => {
    rows.value.splice(index, 1);
    rowNames.value.splice(index, 1);
}

const removeRows = (rows: FeatureSummary[]) => {
    for (const row of rows) {
        const idx = rowNames.value.indexOf(row.name);
        if (idx !== -1) {
            removeRow(rowNames.value.indexOf(row.name));
        }
    }
}

const debouncedInit = useDebounceFn(initializeData, 100);

onMounted(() => {
    debouncedInit();
});

watch(() => selectedTaxonomicRank, () => {
    debouncedInit();
});

watch(() => props.analyses, () => {
    debouncedInit();
});

watch(() => rescaledRows, async () => {
    await nextTick();
    // Wait a little bit for the svg to be rendered
    setTimeout(() => {
        svg.value = heatmapWrapper.value?.querySelector("svg") as SVGElement;
    }, 100);
}, { deep: true });
</script>

<style>

</style>
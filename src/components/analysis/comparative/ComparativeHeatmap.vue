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
                <v-list-item>
                    <v-checkbox
                        v-model="useAbsoluteValues"
                        label="Use absolute peptide counts"
                        color="primary"
                        density="compact"
                        hide-details
                    />
                </v-list-item>
            </template>

            <template #visualization>
                <v-row style="padding-top: 50px;" class="ma-0">
                    <v-col :cols="6">
                        <div ref="heatmapWrapper" class="mx-4 mb-4">
                            <heatmap
                                :data="rows"
                                :row-names="rowNames"
                                :col-names="colNames"
                                @deselect-row="removeRow"
                            >
                                <template #row-selector>
                                    <v-unipept-card style="width: 800px;" elevation="10">
                                        <v-card-title>
                                            <div class="text-h5">Add rows</div>
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
                                                items-per-page="5"
                                                :items-per-page-options="[5, 10, -1]"
                                                density="compact"
                                                :custom-key-sort="{
                                                    'matchingSamples': customMatchingSamplesSort
                                                }"
                                            >
                                                <template #item.matchingSamples="{ item }">
                                                    {{ item.matchingSamples.length }}
                                                </template>
                                                <template #item.averageRelativeAbundance="{ item }">
                                                    {{ (item.averageRelativeAbundance * 100).toFixed(2) }}%
                                                </template>
                                                <template #item.action="{ item }">
                                                    <v-btn
                                                        color="primary"
                                                        density="compact"
                                                        variant="text"
                                                        prepend-icon="mdi-plus"
                                                        text="Add"
                                                        @click="addRow(item)"
                                                    >
                                                    </v-btn>
                                                </template>
                                            </v-data-table>
                                        </v-card-text>
                                    </v-unipept-card>
                                </template>
                            </heatmap>
                        </div>
                    </v-col>
                    <v-col :cols="6">


                        <v-unipept-card class="mr-4">
                            <v-card-title>
                                <div class="text-h5">Cell details</div>
                            </v-card-title>
                            <v-card-text>
                                <v-empty-state
                                    icon="mdi-cursor-default-click"
                                    color="primary"
                                    title="No cell selected"
                                    text="Select a cell from the heatmap on the left to get a detailed information overview."
                                />
                            </v-card-text>
                        </v-unipept-card>

                    </v-col>
                </v-row>

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

const featureTableHeaders: any = [
    {
        title: "Name",
        align: "start",
        value: "name",
        sortable: true,
        width: "60%"
    }, {
        title: "Matching Samples",
        align: "end",
        value: "matchingSamples",
        sortable: true,
        width: "15%"
    }, {
        title: "Avg. Rel. Abundance",
        align: "end",
        value: "averageRelativeAbundance",
        sortable: true,
        width: "15%"
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
const rowNames: Ref<string[]> = ref([]);

// The columns of the heatmap always correspond to the selected analyses
const colNames = computed(() => props.analyses.map(a => a.name));

const featureItems: Ref<Map<string, FeatureItem<NcbiTaxon>[]>> = ref(new Map());
const featureSummaries: Ref<Map<number, FeatureSummary>> = ref(new Map());

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

        let maxCount: number = 0;

        analysis.ncbiTree.callRecursivelyPostOrder((x: NcbiTreeNode) => {
            if (x && x.extra.rank === selectedTaxonomicRank.value) {
                const taxonObj = ncbiOntology.get(x.id);

                if (!taxonObj || !taxonObj.name.toLowerCase().includes(featureSearchValue.value.toLowerCase())) {
                    return;
                }

                if (x.count > maxCount) {
                    maxCount = x.count;
                }

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
            featureItem.relativeAbundance = featureItem.peptideCount / maxCount;
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

const removeRow = (index: number) => {
    rows.value.splice(index, 1);
    rowNames.value.splice(index, 1);
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
})

watch(() => props.analyses, async () => {
    await nextTick();
    svg.value = heatmapWrapper.value?.querySelector("svg") as SVGElement;
}, { immediate: true });
</script>

<style>

</style>
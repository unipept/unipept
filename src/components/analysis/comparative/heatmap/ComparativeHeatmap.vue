<template>
    <div>
        <visualization-controls
            caption="Hover over the cells to see more details"
            :settings="false"
            :download="() => downloadImageModalOpen = true"
        >
            <template #visualization>
                <div style="padding-top: 50px;">
                    <div class="mx-4 mb-6">
                        <v-expansion-panels color="grey-lighten-4" v-model="settingsPanelOpen">
                            <v-expansion-panel value="settings">
                                <v-expansion-panel-title>
                                    <v-icon class="mr-2">
                                        mdi-cog
                                    </v-icon>
                                    Heatmap settings
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <v-alert icon="mdi-help-circle-outline" class="my-2" density="compact">
                                        <v-alert-title @click="showAlertContent = !showAlertContent" style="cursor: pointer;">
                                            <div class="d-flex" style="width: 100%;">
                                                <div class="flex-grow-1" style="font-size: 16px;">Relative or absolute peptide counts?</div>
                                                <v-icon v-if="showAlertContent" class="float-end">
                                                    mdi-chevron-up
                                                </v-icon>
                                                <v-icon v-else class="float-end">
                                                    mdi-chevron-down
                                                </v-icon>
                                            </div>
                                        </v-alert-title>
                                        <div v-if="showAlertContent">
                                            <div class="my-4">
                                                Unipept offers three normalization methods to gain different insights into your data.
                                                Each method provides a unique perspective on how your samples relate to each other.
                                            </div>

                                            <div>
                                                <div class="font-weight-bold">1. Use percentages per sample (column-based)</div>
                                                <div class="font-italic">&quot;What proportion of this sample is made up by each organism?&quot;</div>
                                                <v-row>
                                                    <v-col :cols="12" class="ml-1 mb-4">
                                                        <ul>
                                                            <li>
                                                                Each column is normalized independently. This means that values in the
                                                                heatmap reflect <span class="font-weight-bold">the fraction of each sample</span> that is made up of each
                                                                organism.
                                                            </li>
                                                            <li>
                                                                Ideal for spotting which organisms are <span class="font-weight-bold">most or least abundant in a sample</span>.
                                                            </li>
                                                        </ul>
                                                    </v-col>
                                                </v-row>
                                            </div>

                                            <div>
                                                <div class="font-weight-bold">2. Use percentages per organism (row-based)</div>
                                                <div class="font-italic">&quot;In which sample does an organism live?&quot;</div>
                                                <v-row>
                                                    <v-col :cols="12" class="ml-1 mb-4">
                                                        <ul>
                                                            <li>
                                                                Relative peptide counts are individually computed per row.
                                                                Absolute differences between organisms are flattened, but this method <span class="font-weight-bold">highlights how each organism is distributed across samples</span>.
                                                            </li>
                                                            <li>
                                                                Ideal for spotting organisms that are <span class="font-weight-bold">enriched or depleted</span> in specific
                                                                conditions (e.g. healthy vs disease).
                                                            </li>
                                                        </ul>
                                                    </v-col>
                                                </v-row>
                                            </div>

                                            <div>
                                                <div class="font-weight-bold">3. Use absolute peptide counts (no-transformation)</div>
                                                <div class="font-italic">&quot;How much of each organism was found?&quot;</div>
                                                <v-row>
                                                    <v-col :cols="12" class="ml-1">
                                                        <ul>
                                                            <li>
                                                                No scaling or transformation is applied to the data. The bigger the
                                                                original number, the higher its signal in the heatmap will be.
                                                            </li>
                                                            <li>
                                                                Watch out! Can be misleading when <span class="font-weight-bold">total sample size differs</span> a lot.
                                                            </li>
                                                        </ul>
                                                    </v-col>
                                                </v-row>
                                            </div>

                                            <div class="d-flex justify-center mt-4">
                                                <v-btn @click="showAlertContent = false" variant="text">
                                                    <v-icon>mdi-chevron-up</v-icon>
                                                    <span>Hide</span>
                                                </v-btn>
                                            </div>
                                        </div>
                                    </v-alert>

                                    <v-row class="mt-1">
                                        <v-col :cols="6">
                                            <v-select
                                                label="Rank"
                                                density="comfortable"
                                                variant="underlined"
                                                :items="taxonomicRankOptions"
                                                v-model="selectedTaxonomicRank"
                                                persistent-hint
                                                hint="Level of taxonomic classification to display"
                                            />
                                        </v-col>
                                        <v-col :cols="6">
                                            <v-select
                                                label="Use percentages"
                                                density="comfortable"
                                                variant="underlined"
                                                :items="transformationTypes"
                                                item-title="description"
                                                item-value="type"
                                                v-model="selectedNormalizationType"
                                                persistent-hint
                                                hint="Convert raw counts to percentages for more meaningful comparisons between samples of different sizes"
                                            />
                                        </v-col>
                                        <v-col :cols="4">
                                            <v-checkbox
                                                v-model="useFixedColorScale"
                                                label="Use fixed color scale"
                                                variant="underlined"
                                                color="primary"
                                                density="compact"
                                                persistent-hint
                                                hint="Maintain consistent color mapping across different datasets"
                                            />
                                        </v-col>
                                        <v-col :cols="4">
                                            <v-checkbox
                                                v-model="showCellLabels"
                                                label="Show labels in cells"
                                                variant="underlined"
                                                color="primary"
                                                density="compact"
                                            />
                                        </v-col>
                                        <v-col :cols="4">
                                            <v-checkbox
                                                v-model="showTooltips"
                                                label="Show tooltip on hoover"
                                                variant="underlined"
                                                color="primary"
                                                density="compact"
                                            />
                                        </v-col>
                                    </v-row>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </div>

                    <div class="ma-0 d-flex ga-8">
                        <div class="mx-4">
                            <div ref="heatmapWrapper" class="mb-4">
                                <v-empty-state
                                    v-if="rowData.length === 0"
                                    icon="mdi-table-question"
                                    color="grey-lighten-1"
                                    title="No data available"
                                    text="Change your selection to get data for the heatmap. This can happen if the selected taxonomic rank is not found in the sample selection."
                                />

                                <heatmap
                                    v-else
                                    :data="rowData"
                                    :row-names="rowNames"
                                    :col-names="colNames"
                                    :show-cell-labels="showCellLabels"
                                    :show-tooltips="showTooltips"
                                    @deselect-row="removeRow"
                                    v-model:selected-cell="selectedCell"
                                >
                                    <template #tooltip-content="{ selectedRow, selectedCol }">
                                        <template v-if="selectedCol !== -1 && selectedRow !== -1 && rows[selectedRow]">
                                            <div class="text-subtitle-1"><span class="font-italic">{{ rowNames[selectedRow] }}</span> in {{ analyses[selectedCol].name }}</div>
                                            <div>
                                                <span class="font-weight-bold">{{ rows[selectedRow].peptideCount[selectedCol] }} peptides</span>
                                                in {{ props.analyses[selectedCol].name }} linked to {{ selectedTaxonomicRank }}
                                                <span class="font-italic">{{ rows[selectedRow].name }}</span>
                                            </div>
                                            <div>
                                                Corresponds to
                                                <span class="font-weight-bold">{{(rows[selectedRow].columnWiseAbundances[selectedCol] * 100).toFixed(2) }}%</span>
                                                of all species for this sample.
                                            </div>
                                        </template>
                                    </template>
                                    <template #row-selector>
                                        <heatmap-ncbi-selector
                                            :selected-taxonomic-rank="selectedTaxonomicRank"
                                            :feature-items="featureItems"
                                            :row-names="rowNames"
                                            @select-row="selectRow"
                                            @deselect-row="deselectRow"
                                        />
                                    </template>
                                </heatmap>
                            </div>
                        </div>
                        <v-divider vertical class="mb-2"/>
                        <div class="flex-grow-1 mr-8">
                            <v-empty-state
                                v-if="selectedCell.rowIdx === -1"
                                icon="mdi-cursor-default-click"
                                color="grey-lighten-1"
                                title="No cell selected"
                                text="Select a cell from the heatmap on the left to get a detailed information overview."
                            />
                            <div v-else>
                                <div class="d-flex align-center my-2">
                                    <div class="text-h5"><span class="font-italic">{{ rowNames[selectedCell.rowIdx] }}</span> in {{ colNames[selectedCell.colIdx] }}</div>
                                </div>
                                <h3 class="mb-1">
                                    <span class="font-italic">{{ rowNames[selectedCell.rowIdx] }}</span> abundance across samples
                                </h3>
                                <div>
                                    <table style="width: 100%; table-layout: fixed;">
                                        <colgroup>
                                            <col style="width: 200px;">
                                            <col style="width: auto;">
                                        </colgroup>
                                        <tbody>
                                            <tr v-for="(item, idx) of selectedCellSampleSummary!" :key="idx">
                                                <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                                    <span style="font-size: 14px;" :class="idx === selectedCell.colIdx ? 'font-weight-bold' : ''">
                                                        {{ item.sampleName }}
                                                    </span>
                                                </td>
                                                <td>
                                                    <v-progress-linear
                                                        :model-value="item.abundance * 100"
                                                        height="20"
                                                        :color="idx === selectedCell.colIdx ? 'primary' : 'grey'"
                                                    >
                                                        <span :style="{ 'font-size': '12px' }">
                                                            {{ item.label }}
                                                        </span>
                                                    </v-progress-linear>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h3 class="mt-4 mb-1">
                                    {{ selectedTaxonomicRank.charAt(0).toUpperCase() + selectedTaxonomicRank.slice(1) }}
                                    abundance within
                                    {{ colNames[selectedCell.colIdx] }}
                                </h3>
                                <table style="width: 100%; table-layout: fixed;">
                                    <colgroup>
                                        <col style="width: 200px;">
                                        <col style="width: auto;">
                                    </colgroup>
                                    <tbody>
                                        <tr v-for="(item, idx) of selectedCellOrganismSummary!" :key="idx">
                                            <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                                <span style="font-size: 14px;" :class="idx === selectedCell.rowIdx ? 'font-weight-bold' : ''">
                                                    {{ item.organismName }}
                                                </span>
                                            </td>
                                            <td>
                                                <v-progress-linear
                                                    :model-value="item.abundance * 100"
                                                    height="20"
                                                    :color="idx === selectedCell.rowIdx ? 'primary' : 'grey'"
                                                >
                                                    <span :style="{ 'font-size': '12px' }">
                                                        {{ item.label }}
                                                    </span>
                                                </v-progress-linear>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
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
import HeatmapNcbiSelector from "@/components/analysis/comparative/heatmap/HeatmapNcbiSelector.vue";
import {NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import {useDebounceFn} from "@vueuse/core";

export type FeatureId = number | string;

/**
 * ** General settings for the comparative heatmap **
 */

const useFixedColorScale = ref(true);
const showCellLabels = ref(true);
const showTooltips = ref(true);

const settingsPanelOpen: Ref<string[]> = ref(["settings"]);
const showAlertContent = ref(false);

enum TransformationType {
    RelativePerSample,
    RelativePerOrganism,
    None
}

interface TransformationItem {
    type: TransformationType,
    description: string
}

const transformationTypes: Ref<TransformationItem[]> = ref([
    {
        type: TransformationType.RelativePerSample,
        description: "Use percentages per sample (column-based)"
    },
    {
        type: TransformationType.RelativePerOrganism,
        description: "Use percentages per organism (row-based)"
    },
    {
        type: TransformationType.None,
        description: "Use absolute peptide counts (no-transformation)"
    }
]);
const selectedNormalizationType: Ref<TransformationType> = ref(TransformationType.RelativePerSample);

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

/**
 * ** Props and data required for rendering the heatmap itself **
 */

/**
 * Data that can directly be visualized by the heatmap.
 */
export interface FeatureData {
    id: FeatureId,
    name: string,
    matchingSamples: number,
    /**
     * An array with the same length as the amount of selected samples.
     *
     * Each item in this array corresponds to analysis at that position in the analyses prop.
     */
    peptideCount: number[],
    /**
     * Array with peptide counts normalized over all rows (i.e. column-wise normalization). Divides each organism’s
     * abundance by the total peptide count in its sample. This shows the organism’s relative importance within each
     * sample, making samples comparable even when they differ in size or sequencing depth.
     *
     * Each item in this array corresponds to analysis at that position in the analyses prop.
     */
    columnWiseAbundances: number[],
    /**
     * Divides each abundance value by the total count for that organism across all samples. This highlights how an
     * organism’s signal is distributed across the dataset, helping you detect condition- or sample-specific expression
     * patterns.
     *
     * Each item in this array corresponds to analysis at that position in the analyses prop.
     */
    rowWiseAbundances: number[]
}

// This map contains all items that can be selected by the user for visualization in the heatmap. This map is always
// unfiltered (i.e. contains all items, filtering by search term is performed by other components).
const featureItems: Ref<Map<FeatureId, FeatureData>> = ref(new Map());

/**
 * This function computes all items that can be selected by the user. This includes the amount of samples that match
 * each of these items, the peptide count per sample and the relative abundances over rows or columns (see the
 * FeatureData interface for more information on this).
 */
const computeFeatureItems: () => Map<FeatureId, FeatureData> = () => {
    const items = new Map<FeatureId, FeatureData>();
    const totalPeptideCountPerSample = new Array(props.analyses.length).fill(0);

    for (const [analysisIdx, analysis] of props.analyses.entries()) {
        const ncbiOntology = analysis.ontologyStore.ncbiOntology;

        // First we retrieve some basic information of all organisms of the selected rank type
        analysis.ncbiTree.callRecursivelyPostOrder((x: NcbiTreeNode) => {
            if (x && x.extra.rank === selectedTaxonomicRank.value) {
                const taxonObj = ncbiOntology.get(x.id);

                if (!taxonObj) {
                    return;
                }

                if (!items.has(taxonObj.id)) {
                    items.set(taxonObj.id, {
                        id: taxonObj.id,
                        name: taxonObj.name,
                        matchingSamples: 0,
                        peptideCount: new Array(props.analyses.length).fill(0),
                        columnWiseAbundances: new Array(props.analyses.length).fill(0),
                        rowWiseAbundances: new Array(props.analyses.length).fill(0)
                    });
                }

                const dataObj = items.get(taxonObj.id)!;

                dataObj.matchingSamples += 1;
                dataObj.peptideCount[analysisIdx] = x.count;
                totalPeptideCountPerSample[analysisIdx] += x.count;
            }
        });
    }

    // Now that we have all information, we can compute the relative abundance values
    for (const [taxonId, dataObj] of items.entries()) {
        for (let analysisIdx = 0; analysisIdx < props.analyses.length; analysisIdx++) {
            if (totalPeptideCountPerSample[analysisIdx] === 0) {
                dataObj.columnWiseAbundances[analysisIdx] = 0;
            } else {
                dataObj.columnWiseAbundances[analysisIdx] = dataObj.peptideCount[analysisIdx] / totalPeptideCountPerSample[analysisIdx];
            }
        }

        // Compute the sum of this row
        const rowSum = dataObj.peptideCount.reduce((a, b) => a + b, 0);
        dataObj.rowWiseAbundances = dataObj.peptideCount.map(x => rowSum === 0 ? 0 : (x / rowSum));
    }

    return items;
};

// Keeps track of the LCA ids that are selected by the user and that should be visualized by the heatmap.
const selectedIds: Ref<FeatureId[]> = ref([]);

// For each selected ID (displayed on the rows), we keep track of all associated FeatureData-objects to aid in the
// visualization step.
const rows: Ref<FeatureData[]> = ref([]);
const rowNames: ComputedRef<string[]> = computed(() => rows.value.map(x => x.name));
const colNames: ComputedRef<string[]> = computed(() => props.analyses.map(a => a.name));

/**
 * Computes the actual values that should be rendered by the heatmap. All returned values are in the [0, 1] range
 * and take into account the visualization / normalization settings that are selected by the end user.
 */
const rowData: ComputedRef<{ value: number, label: string }[][]> = computed(() => {
    let transformedRows: number[][];

    if (selectedNormalizationType.value === TransformationType.None) {
        // We still need to map these values to the [0, 1]-range for the visualization itself.
        let minimum = Number.POSITIVE_INFINITY;
        let maximum = 0;

        if (useFixedColorScale.value) {
            // We look for the global minimum and maximum and use that to generate the [0, 1]-values
            for (const [taxonId, dataObj] of featureItems.value.entries()) {
                minimum = Math.min(minimum, ...dataObj.peptideCount);
                maximum = Math.max(maximum, ...dataObj.peptideCount);
            }
        } else {
            // We only look for the minimum and maximum amongst the visible cells
            for (const row of rows.value) {
                minimum = Math.min(minimum, ...row.peptideCount);
                maximum = Math.max(maximum, ...row.peptideCount);
            }
        }

        // Now we do the actual computation to map all values within the desired range
        return rows.value.map(row => row.peptideCount.map(x => {
            const val = (x - minimum) / (maximum - minimum);
            return { value: val, label: `${x}` };
        }));
    } else if (selectedNormalizationType.value === TransformationType.RelativePerSample) {
        if (useFixedColorScale.value) {
            // We can simply return the pre-computed column-wise abundances
            transformedRows = rows.value.map(row => row.columnWiseAbundances);
        } else {
            // We have to find the min and max of the column-wise abundances and remap those to the [0, 1]-range
            let minValue = 1;
            let maxValue = 0;

            for (const row of rows.value) {
                minValue = Math.min(minValue, ...row.columnWiseAbundances);
                maxValue = Math.max(maxValue, ...row.columnWiseAbundances);
            }

            transformedRows = rows.value.map(row => row.columnWiseAbundances.map(x => (x - minValue) / (maxValue - minValue)));
        }
    } else {
        if (useFixedColorScale.value) {
            transformedRows = rows.value.map(row => [...row.rowWiseAbundances]);
        } else {
            // We have to find the min and max of the column-wise abundances and remap those to the [0, 1]-range
            let minValue = 1;
            let maxValue = 0;

            for (const row of rows.value) {
                minValue = Math.min(minValue, ...row.rowWiseAbundances);
                maxValue = Math.max(maxValue, ...row.rowWiseAbundances);
            }

            transformedRows = rows.value.map(row => row.rowWiseAbundances.map(x => (x - minValue) / (maxValue - minValue)));
        }
    }

    return transformedRows.map(row => row.map((x, i) => ({ value: x, label: `${(x * 100).toFixed(2)}%` })));
});

/**
 * ** Props and data that correspond to the currently selected cell details and overview. **
 */

const selectedCell: Ref<{rowIdx: number, colIdx: number}> = ref({rowIdx: -1, colIdx: -1});

const selectedCellSampleSummary: ComputedRef<{ sampleName: string, label: string, abundance: number }[] | undefined> = computed(() => {
    if (selectedCell.value.rowIdx === -1 || selectedCell.value.colIdx === -1) {
        return undefined;
    }

    const output = [];

    for (const [col, analysis] of props.analyses.entries()) {
        output.push({
            sampleName: analysis.name,
            label: (rows.value[selectedCell.value.rowIdx].columnWiseAbundances[col] * 100).toFixed(2) + "%",
            abundance: rows.value[selectedCell.value.rowIdx].columnWiseAbundances[col]
        })
    }

    return output.sort((a: { sampleName: string, label: string, abundance: number }, b: { sampleName: string, label: string, abundance: number }) => b.abundance - a.abundance);
});

const selectedCellOrganismSummary: ComputedRef<{ organismName: string, label: string, abundance: number }[] | undefined> = computed(() => {
    if (selectedCell.value.rowIdx === -1 || selectedCell.value.colIdx === -1) {
        return undefined;
    }

    const output = [];

    for (const [row, organismId] of selectedIds.value.entries()) {
        output.push({
            organismName: rowNames.value[row],
            label: (rows.value[row].columnWiseAbundances[selectedCell.value.colIdx] * 100).toFixed(2) + "%",
            abundance: rows.value[row].columnWiseAbundances[selectedCell.value.colIdx]
        })
    }


    return output.sort((a: { organismName: string, label: string, abundance: number }, b: { organismName: string, label: string, abundance: number }) => b.abundance - a.abundance);
});

/**
 * This function regenerates all input data for the heatmap and should be called whenever the user selects a different
 * feature source (i.e. changes the rank, ...) or when the user selects a different collection of samples for the
 * comparison.
 */
const initializeData = () => {
    featureItems.value = computeFeatureItems();

    // Select the top 10 most abundant features for the initial state of the heatmap.
    selectedIds.value = [...featureItems.value.values()].toSorted((a, b) => {
        if (b.matchingSamples !== a.matchingSamples) {
            return b.matchingSamples - a.matchingSamples;
        }

        const avgRelAbundanceA = a.columnWiseAbundances.reduce((a, b) => a + b, 0) / a.matchingSamples;
        const avgRelAbundanceB = b.columnWiseAbundances.reduce((a, b) => a + b, 0) / b.matchingSamples;

        return avgRelAbundanceB - avgRelAbundanceA;
    }).slice(0, 10).map(i => i.id);

    rows.value = selectedIds.value.map(id => featureItems.value.get(id)!);
};

const selectRow = (featureId: FeatureId) => {
    if (!selectedIds.value.includes(featureId)) {
        selectedIds.value.push(featureId);
        rows.value = selectedIds.value.map(id => featureItems.value.get(id)!);
    }
};

const removeRow = (index: number) => {
    if (selectedCell.value.rowIdx === index) {
        selectedCell.value.rowIdx = -1;
        selectedCell.value.colIdx = -1;
    }

    if (selectedCell.value.rowIdx >= index) {
        selectedCell.value.rowIdx -= 1;
    }

    selectedIds.value.splice(index, 1);
    rows.value = selectedIds.value.map(id => featureItems.value.get(id)!);
}

const deselectRow = (featureId: FeatureId) => {
    const index = selectedIds.value.indexOf(featureId);
    removeRow(index);
}

const debouncedInit = useDebounceFn(initializeData, 100);

onMounted(() => {
    debouncedInit();
});

watch(() => selectedTaxonomicRank.value, () => {
    debouncedInit();
});

watch(() => props.analyses, () => {
    debouncedInit();
});

watch(() => [rowData, useFixedColorScale, showCellLabels], async () => {
    await nextTick();
    // Wait a little bit for the svg to be rendered
    setTimeout(() => {
        svg.value = heatmapWrapper.value?.querySelector("svg") as SVGElement;
    }, 100);
}, { deep: true });
</script>

<style>

</style>
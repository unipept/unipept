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
                        label="Feature type"
                        density="comfortable"
                        :items="featureTypes"
                        v-model="selectedFeatureType"
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
                            :data="randomRows"
                            :row-names="randomRowNames"
                            :col-names="colNames"
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
                                                :items="matchingItems"
                                                :headers="featureTableHeaders"
                                                density="compact"
                                                items-per-page="5"
                                                :items-per-page-options="[5, 10, -1]"
                                            >
                                                <template #item.action="{ item }">
                                                    <v-btn
                                                        color="primary"
                                                        density="compact"
                                                        variant="text"
                                                        prepend-icon="mdi-plus"
                                                        text="Add"
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

interface FeatureItem {
    name: string,
    matchingSamples: number,
    averageRelativeAbundance: number
}

const useAbsoluteValues = ref(false);

const downloadImageModalOpen = ref(false);

const heatmapWrapper = ref<HTMLDivElement>();
const svg: Ref<SVGElement | undefined | null> = ref();

const props = defineProps<{
    analyses: SingleAnalysisStore[]
}>();

const featureTypes: string[] = [
    "NCBI Taxonomy",
    "Gene Ontology",
    "EC Numbers"
];

const selectedFeatureType: Ref<string> = ref(featureTypes[0]);

const featureSearchValue: Ref<string> = ref("");

const featureTableHeaders: any = [
    {
        title: "Name",
        align: "start",
        value: "name",
        sortable: true,
        width: "60%"
    }, {
        title: "Matching samples",
        align: "center",
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

// Temporary generate 10 random rows with data that can be used for the heatmap visualization
const randomRows: Ref<number[][]> = ref([]);

const randomRowNames = [
    "Escherichia coli",
    "Staphylococcus aureus",
    "Bacillus subtilis",
    "Salmonella enterica",
    "Pseudomonas aeruginosa",
    "Streptococcus pneumoniae",
    "Mycobacterium tuberculosis",
    "Lactobacillus acidophilus",
    "Clostridium difficile",
    "Helicobacter pylori"
];

const colNames = computed(() => props.analyses.map(a => a.name));

onMounted(() => {
    randomRows.value = [];
    for (let i = 0; i < 10; i++) {
        const row = [];
        for (let j = 0; j < props.analyses.length; j++) {
            row.push(Math.random());
        }
        randomRows.value.push(row);
    }
});

watch(() => props.analyses, () => {
    randomRows.value = [];
    for (let i = 0; i < 10; i++) {
        const row = [];
        for (let j = 0; j < props.analyses.length; j++) {
            row.push(Math.random());
        }
        randomRows.value.push(row);
    }
});

watch(() => props.analyses, async () => {
    await nextTick();
    svg.value = heatmapWrapper.value?.querySelector("svg") as SVGElement;
}, { immediate: true });

const matchingItems: ComputedRef<FeatureItem[]> = computed(() => {
    if (selectedFeatureType.value === "NCBI Taxonomy") {
        // TODO: instead of only showing the lowest common ancestor here, we should also properly take into account
        // TODO: higher ranks using the NCBI tree that can be selected (and correctly propagate their counts).

        // Maps LCA taxon ID onto it's peptide count and sample count
        const features = new Map<number, FeatureItem>();

        for (const analysis of props.analyses) {
            const ncbiOntology = analysis.ontologyStore.ncbiOntology;
            for (const [lca, lcaCount] of analysis.lcaTable!.counts) {
                const taxonObj = ncbiOntology.get(lca);

                if (!taxonObj || !taxonObj.name.toLowerCase().includes(featureSearchValue.value.toLowerCase())) {
                    continue;
                }

                if (!features.has(lca)) {
                    features.set(lca, {
                        name: taxonObj.name,
                        matchingSamples: 1,
                        averageRelativeAbundance: 0
                    });
                } else {
                    const featureObj = features.get(lca)!;
                    featureObj.matchingSamples += 1;
                }
            }
        }

        return [...features.values()];
    }

    return [];
});
</script>

<style>

</style>
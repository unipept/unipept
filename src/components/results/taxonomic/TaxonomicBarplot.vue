<template>
    <div>
        <visualization-controls
            caption="Hover over the bars to see more details"
            :download="() => downloadImageModalOpen = true"
        >

            <template #visualization>
                <div style="padding-top: 50px;">
                    <div class="mx-4">
                        <v-expansion-panels color="grey-lighten-4" class="mb-4" v-model="settingsPanelOpen">
                            <v-expansion-panel value="settings">
                                <v-expansion-panel-title>
                                    <v-icon class="mr-2">
                                        mdi-cog
                                    </v-icon>
                                    Barplot settings
                                </v-expansion-panel-title>
                                <v-expansion-panel-text>
                                    <v-row class="mt-1">
                                        <v-col :cols="3">
                                            <v-select
                                                v-model="selectedTaxonomicRank"
                                                :items="taxonomicRankOptions"
                                                label="Rank"
                                                hide-details
                                                variant="underlined"
                                                density="comfortable"
                                            />
                                        </v-col>
                                        <v-col :cols="3">
                                            <v-number-input
                                                :reverse="false"
                                                label="Taxa"
                                                :min="1"
                                                :max="20"
                                                :hideInput="false"
                                                :inset="false"
                                                variant="underlined"
                                                density="comfortable"
                                                v-model="taxonCount"
                                            />
                                        </v-col>
                                        <v-col :cols="3">
                                            <v-checkbox
                                                v-model="useAbsoluteValues"
                                                label="Use absolute peptide counts"
                                                color="primary"
                                                density="compact"
                                                hide-details
                                            />
                                        </v-col>
                                        <v-col :cols="3">
                                            <v-checkbox
                                                v-model="showTooltips"
                                                label="Show tooltip on hoover"
                                                color="primary"
                                                density="compact"
                                                hide-details
                                            />
                                        </v-col>
                                    </v-row>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </div>
                    <div ref="barplotWrapper">
                        <barplot :bars="barData" :settings="barplotSettings" />
                    </div>
                </div>
            </template>
        </visualization-controls>
    </div>

    <download-image
        v-if="svg"
        v-model="downloadImageModalOpen"
        :image="svg"
        filename="barplot"
    />
</template>

<script setup lang="ts">
    import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
    import {ref, Ref, onMounted, watch, nextTick} from "vue";
    import Barplot from "@/components/visualization/barplot/Barplot.vue";
    import {NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
    import VisualizationControls from "@/components/results/taxonomic/VisualizationControls.vue";
    import {Bar, BarItem, BarplotSettings} from "unipept-visualizations";
    import DownloadImage from "@/components/image/DownloadImage.vue";
    import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";

    const props = withDefaults(defineProps<{
        analyses: SingleAnalysisStore[],
        comparative?: boolean
    }>(), { comparative: false });

    const settingsPanelOpen: Ref<string[]> = ref(["settings"]);

    const taxonomicRankOptions: Ref<string[]> = ref(
        Object.values(NcbiRank)
    );

    const selectedTaxonomicRank: Ref<string> = ref("species");

    const useAbsoluteValues = ref(false);

    const showTooltips = ref(true);

    const taxonCount = ref(15);

    const barplotWrapper = ref<HTMLDivElement>();
    const containerWidth: Ref<number> = ref(800);
    const barplotSettings: Ref<BarplotSettings> = ref(new BarplotSettings());
    const barData: Ref<Bar[]> = ref([]);

    const downloadImageModalOpen: Ref<boolean> = ref(false);

    const svg: Ref<SVGElement | undefined | null> = ref();

    // Display the barplot below the visualization settings bar
    barplotSettings.value.chart.padding.left = 15;
    barplotSettings.value.chart.padding.right = 30;
    barplotSettings.value.legend.padding.top = 40;
    barplotSettings.value.legend.padding.left = 20;
    barplotSettings.value.height = 250 + 100 * props.analyses.length;
    barplotSettings.value.showBarLabel = props.comparative;
    barplotSettings.value.barLabelWidth = 200;
    barplotSettings.value.displayMode = "relative";
    barplotSettings.value.maxItems = taxonCount.value;
    barplotSettings.value.barHeight = 100;

    const initializeSpeciesBar = () => {
        const createdBars = [];
        for (const analysis of props.analyses) {
            const nodesAtRank: NcbiTreeNode[] = [];
            analysis.ncbiTree.callRecursivelyPostOrder((x: NcbiTreeNode) => {
                if (x && x.extra.rank === selectedTaxonomicRank.value) {
                    nodesAtRank.push(x);
                }
            });

            const items: BarItem[] = [];

            for (const speciesNode of nodesAtRank) {
                items.push({
                    label: speciesNode.name,
                    counts: speciesNode.count
                });
            }

            items.sort((a: BarItem, b: BarItem) => b.counts - a.counts);

            createdBars.push({
                label: analysis.name,
                items
            });
        }
        barplotSettings.value.height = barplotSettings.value.barHeight * props.analyses.length + 100 + Math.ceil((taxonCount.value + 1) / 3) * 30;
        barData.value = createdBars;
    }

    onMounted(() => {
        const observer = new ResizeObserver(() => {
            containerWidth.value = barplotWrapper.value?.offsetWidth ?? 800;
            // containerHeight.value = barplotWrapper.value?.offsetHeight ?? props.height;

            barplotSettings.value.width = containerWidth.value;
            // barplotSettings.value.height = containerHeight.value;
        });

        if (barplotWrapper.value) {
            observer.observe(barplotWrapper.value);
        }

        initializeSpeciesBar();
    });

    watch(() => props.analyses, () => {
        initializeSpeciesBar();
    });

    watch(selectedTaxonomicRank, () => {
        initializeSpeciesBar();
    });

    watch(useAbsoluteValues, () => {
        if (useAbsoluteValues.value) {
            barplotSettings.value.displayMode = "absolute";
        } else {
            barplotSettings.value.displayMode = "relative";
        }

        initializeSpeciesBar();
    });

    watch(taxonCount, () => {
        barplotSettings.value.maxItems = taxonCount.value;
        initializeSpeciesBar();
    })

    watch(showTooltips, () => {
        barplotSettings.value.enableTooltips = showTooltips.value;
        initializeSpeciesBar();
    })

    watch(barData, async () => {
        await nextTick();
        svg.value = barplotWrapper.value?.querySelector("svg") as SVGElement;
    }, { immediate: true })
</script>

<style scoped>

</style>
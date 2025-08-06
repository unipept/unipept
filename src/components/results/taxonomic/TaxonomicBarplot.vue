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
                                                v-model="showTooltip"
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

                    <v-tooltip
                        :model-value="tooltipActive"
                        :target="[tooltipPosition.x, tooltipPosition.y]"
                        :offset="20"
                        location="right"
                    >
                        <template v-if="highlightedData">
                            <div class="text-subtitle-1">{{ highlightedData.organismName }}</div>
                            <div v-for="organismValue of highlightedData.organismValues" :key="organismValue.sampleName">
                                <span :class="{'font-weight-bold': organismValue.isHighlighted}"> {{ organismValue.sampleName }}:</span>
                                {{ organismValue.organismLabel }}
                            </div>
                        </template>
                    </v-tooltip>
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

    // User setting that determines whether tooltips should be shown?
    const showTooltip = ref(true);
    // If the user is hovering over an item, the tooltip component should be active.
    const tooltipActive = ref(false);
    const tooltipPosition: Ref<{x: number, y: number}> = ref({x: 0, y: 0});

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
    // We take over the rendering of the tooltip ourselves and disable the built-in rendering.
    barplotSettings.value.enableTooltips = false;

    const highlightedData = ref<{
        organismName: string,
        organismValues: { sampleName: string, organismLabel: string, isHighlighted: boolean }[]
    } | undefined>(undefined);

    const tooltipDelay = 500;
    let tooltipTimeout: NodeJS.Timeout | undefined;

    barplotSettings.value.mouseIn = (bars: Bar[], barIndex: number, itemIndex: number, mousePosition: { x: number, y: number }) => {
        highlightedData.value = {
            organismName: bars[barIndex].items[itemIndex].label,
            organismValues: bars.map((b, idx) => {
                const indexInBar = b.items.findIndex(x => x.label === bars[barIndex].items[itemIndex].label);

                let organismLabel: string;
                if (indexInBar >= 0) {
                    organismLabel = useAbsoluteValues.value ? `${b.items[indexInBar].counts} peptides`:`${b.items[indexInBar].counts.toFixed(2)}%`;
                } else {
                    organismLabel = useAbsoluteValues.value ? "0 peptides" : "0.00%";
                }

                return {
                    sampleName: b.label,
                    organismLabel,
                    isHighlighted: idx === barIndex
                }
            })
        }

        tooltipPosition.value = mousePosition;
        tooltipTimeout = setTimeout(() => tooltipActive.value = showTooltip.value, tooltipDelay);
    }

    barplotSettings.value.mouseMove = (bars: Bar[], barIndex: number, itemIndex: number, mousePosition: { x: number, y: number }) => {
        tooltipPosition.value = mousePosition;
    }

    barplotSettings.value.mouseOut = (bars: Bar[], barIndex: number, itemIndex: number) => {
        highlightedData.value = undefined;

        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = undefined;
        }

        tooltipActive.value = false;
        tooltipPosition.value = {x: 0, y: 0};
    }


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
        console.log(JSON.stringify(createdBars));
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

    watch(showTooltip, () => {
        initializeSpeciesBar();
    })

    watch(barData, async () => {
        await nextTick();
        svg.value = barplotWrapper.value?.querySelector("svg") as SVGElement;
    }, { immediate: true })
</script>

<style scoped>

</style>
<template>
    <div>
        <visualization-controls
            caption="Hover over the bars to see more details"
            :settings="true"
            :download="() => downloadImageModalOpen = true"
        >
            <template #settings>
                <v-list-item>
                    Barplot settings
                </v-list-item>
                <v-list-item class="mb-4">
                    <v-select
                        v-model="selectedTaxonomicRank"
                        :items="taxonomicRankOptions"
                        label="Rank"
                        hide-details
                        variant="underlined"
                        density="comfortable"
                    />
                </v-list-item>
                <v-list-item class="mb-n4">
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
                <div ref="barplotWrapper" style="padding-top: 50px;">
                    <barplot :bars="barData" :settings="barplotSettings" />
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
    import {ref, Ref, onMounted, watch, computed, nextTick} from "vue";
    import Barplot from "@/components/visualization/barplot/Barplot.vue";
    import {NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
    import VisualizationControls from "@/components/results/taxonomic/VisualizationControls.vue";
    import {Bar, BarItem, BarplotSettings} from "unipept-visualizations";
    import DownloadImage from "@/components/image/DownloadImage.vue";

    const props = defineProps<{
        ncbiRoot: NcbiTreeNode
    }>();


    const taxonomicRankOptions: Ref<string[]> = ref(
        Object.values(NcbiRank)
    );

    const selectedTaxonomicRank: Ref<string> = ref("species");

    const useAbsoluteValues = ref(false);

    const taxonCount = ref(10);

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
    barplotSettings.value.height = 400;
    barplotSettings.value.showBarLabel = false;
    barplotSettings.value.displayMode = "relative";
    barplotSettings.value.barHeight = 100;

    const initializeSpeciesBar = () => {
        const nodesAtSpecies: NcbiTreeNode[] = [];
        props.ncbiRoot.callRecursivelyPostOrder((x: NcbiTreeNode) => {
            if (x && x.extra.rank === selectedTaxonomicRank.value) {
                nodesAtSpecies.push(x);
            }
        });

        const items: BarItem[] = [];

        for (const speciesNode of nodesAtSpecies) {
            items.push({
                label: speciesNode.name,
                counts: speciesNode.count
            });
        }

        items.sort((a: BarItem, b: BarItem) => b.counts - a.counts);

        barData.value = [{
            label: "Sample 1",
            items
        }];
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

    watch(() => props.ncbiRoot, () => {
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
    });

    watch(barplotWrapper, async () => {
        await nextTick();
        svg.value = barplotWrapper.value?.querySelector("svg") as SVGElement;
    }, { immediate: true })
</script>

<style scoped>

</style>
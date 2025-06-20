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
                <div ref="heatmapWrapper" class="mx-4 mb-4" style="padding-top: 50px;">
                    <heatmap :data="randomRows" :row-names="randomRowNames" :col-names="colNames" />
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
import {computed, nextTick, onMounted, Ref, ref, watch} from "vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import * as d3 from 'd3';
import DownloadImage from "@/components/image/DownloadImage.vue";
import Heatmap from "@/components/visualization/heatmap/Heatmap.vue";

const useAbsoluteValues = ref(false);

const downloadImageModalOpen = ref(false);

const heatmapWrapper = ref<HTMLDivElement>();
const svg: Ref<SVGElement | undefined | null> = ref();

const props = defineProps<{
    analyses: SingleAnalysisStore[]
}>();

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
</script>

<style>

</style>
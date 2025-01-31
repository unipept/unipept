<template>
    <visualization-controls
        ref="controls"
        caption="Click a slice to zoom in and the center node to zoom out"
        :download="() => downloadImageModalOpen = true"
        :rotate="rotate"
        :fullscreen="toggleFullscreen"
        :hide-download="isFullscreen"
    >
        <template #visualization>
            <div
                v-once
                ref="visualization"
                style="height: 500px"
                class="visualization-container"
            />
        </template>
    </visualization-controls>

    <download-image
        v-if="svg"
        v-model="downloadImageModalOpen"
        :image="svg"
        filename="heatmap"
    />
</template>

<script setup lang="ts">
import { Heatmap as UnipeptHeatmap, HeatmapSettings } from 'unipept-visualizations';
import {computed, onMounted, ref, useTemplateRef, watch} from 'vue';
import VisualizationControls from "@/components/results/taxonomic/VisualizationControls.vue";
import {useElementSize, useFullscreen} from "@vueuse/core";
import DownloadImage from "@/components/image/DownloadImage.vue";

const props = defineProps<{
    data: number[][]
    rowLabels: string[]
    columnLabels: string[]
}>();

const controls = useTemplateRef<HTMLElement>("controls");
const visualization = useTemplateRef("visualization");
const visualizationObject = ref<UnipeptHeatmap | undefined>(undefined);

const rotated = ref(false);
const downloadImageModalOpen = ref(false);

const svg = computed(() => {
    if (!visualizationObject.value) {
        return;
    }

    const svgString = visualizationObject.value?.toSVG();
    return new DOMParser().parseFromString(svgString, "image/svg+xml").documentElement as unknown as SVGElement;
});

const { isFullscreen, toggle } = useFullscreen(controls);
const { width, height } = useElementSize(controls);

const createHeatmap = (): UnipeptHeatmap | undefined => {
    if (!props.data || props.data.length === 0) {
        return;
    }

    if (!visualization.value) {
        throw new Error("Heatmap visualization HTML-element could not be found.");
    }

    const settings = new HeatmapSettings();
    settings.width = width.value;
    settings.height = height.value;
    settings.dendrogramEnabled = true;

    const rowLabels = rotated.value ? props.columnLabels : props.rowLabels;
    const columnLabels = rotated.value ? props.rowLabels : props.columnLabels;
    const data = rotated.value ? props.data[0].map((_, i) => props.data.map(row => row[i])) : props.data;

    const heatmap = new UnipeptHeatmap(
        visualization.value,
        data,
        rowLabels,
        columnLabels,
        settings
    );

    heatmap.cluster("all");

    return heatmap;
}

const redraw = () => {
    visualizationObject.value = createHeatmap();
};

const download = () => {
    console.log("Download");
};

const rotate = () => {
    rotated.value = !rotated.value;
    redraw();
};

const toggleFullscreen = async () => {
    await toggle();
    redraw();
};

watch(width, () => {
    redraw();
});

onMounted(() => {
    redraw();
});
</script>

<style scoped>
.visualization-container {
    display: flex;
    flex-direction: row-reverse;
}
</style>

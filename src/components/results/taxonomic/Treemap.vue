<template>
    <visualization-controls
        ref="controls"
        caption="Click a square to zoom in and right click to zoom out"
        :download="() => downloadImageModalOpen = true"
        :reset="reset"
        :fullscreen="toggleFullscreen"
        :hide-download="isFullscreen"
        :overlap="false"
    >
        <template #visualization>
            <div
                v-once
                ref="visualization"
                class="visualization-container"
            />
        </template>
    </visualization-controls>

    <download-image
        v-if="div"
        v-model="downloadImageModalOpen"
        :image="div"
        filename="treemap"
    />
</template>

<script setup lang="ts">
import { Treemap as UnipeptTreemap, TreemapSettings } from 'unipept-visualizations';
import {computed, onMounted, ref, useTemplateRef, watch} from 'vue';
import {NcbiTreeNode} from "unipept-web-components";
import VisualizationControls from "@/components/results/taxonomic/VisualizationControls.vue";
import {useElementSize, useFullscreen} from "@vueuse/core";
import DownloadImage from "@/components/image/DownloadImage.vue";

const props = defineProps<{
    ncbiRoot: NcbiTreeNode
}>();

const filterId = defineModel<number>();

const controls = useTemplateRef<HTMLElement>("controls");
const visualization = useTemplateRef<HTMLDivElement>("visualization");
const visualizationObject = ref<UnipeptTreemap | undefined>(undefined);

const downloadImageModalOpen = ref(false);
const div = computed(() => visualization.value);

const { isFullscreen, toggle } = useFullscreen(controls);
const { width, height } = useElementSize(controls);

const createTreemap = (fullscreen = false): UnipeptTreemap | undefined => {
    if (!visualization.value) {
        throw new Error("Treemap visualization HTML-element could not be found.");
    }

    visualization.value.innerHTML = "";

    if(!props.ncbiRoot) return;

    const settings = new TreemapSettings();
    settings.width = width.value;
    settings.height = height.value;
    settings.rerootCallback = d => filterId.value = d.id;
    settings.getTooltipText = tooltipContent;

    const treemap = new UnipeptTreemap(
        visualization.value,
        props.ncbiRoot,
        settings,
    );

    if(fullscreen) {
        const svgEl = visualization.value?.querySelector("svg");
        if(svgEl) {
            svgEl.setAttribute("height", "100%");
            svgEl.setAttribute("width", "100%");
        }
    }

    return treemap;
};

const redraw = () => {
    const savedFilterId = filterId.value;

    if (!savedFilterId) {
        throw new Error("Filter ID for visualization was not properly set.");
    }

    visualizationObject.value = createTreemap(!isFullscreen.value);
    visualizationObject.value?.reroot(savedFilterId, false);
    filterId.value = savedFilterId;
};

const reset = () => {
    filterId.value = 1;
    visualizationObject.value?.reroot(1, false);
};

const toggleFullscreen = async () => {
    await toggle();
    redraw();
};

watch(() => props.ncbiRoot, () => {
    filterId.value = 1;
    redraw();
});

watch(width, () => {
    redraw();
});

watch(filterId, () => {
    if (!filterId.value) {
        // No need to reroot the visualization if no valid filter ID was set.
        return;
    }

    visualizationObject.value?.reroot(filterId.value, false);
});

onMounted(() => {
    redraw();
});
</script>

<script lang="ts">
const tooltipContent = (d: any): string => {
    return (!d.selfCount ? "0" : d.selfCount) +
        (d.selfCount && d.selfCount === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
        (!d.count ? "0" : d.count) +
        (d.count && d.count === 1 ? " sequence" : " sequences") + " specific to this level or lower";
};
</script>

<style scoped>
.visualization-container {
    width: 100%;
    height: 100%;
}
</style>

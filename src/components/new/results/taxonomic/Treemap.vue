<template>
    <visualization-controls
        ref="controls"
        caption="Click a square to zoom in and right click to zoom out"
        :download="download"
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
</template>

<script setup lang="ts">
import { Treemap as UnipeptTreemap, TreemapSettings } from 'unipept-visualizations';
import {onMounted, ref, useTemplateRef, watch} from 'vue';
import {NcbiTreeNode} from "unipept-web-components";
import VisualizationControls from "@/components/new/results/taxonomic/VisualizationControls.vue";
import {useElementSize, useFullscreen} from "@vueuse/core";

const props = defineProps<{
    ncbiRoot: NcbiTreeNode
}>();

const filterId = defineModel<number>();

const controls = useTemplateRef("controls");
const visualization = useTemplateRef("visualization");
const visualizationObject = ref<UnipeptSunburst | undefined>(undefined);

const { isFullscreen, toggle } = useFullscreen(controls);
const { width, height } = useElementSize(controls);

const createTreemap = (fullscreen = false): UnipeptSunburst | undefined => {
    visualization.value.innerHTML = "";

    if(!props.ncbiRoot) return;

    const settings = {
        width: width.value,
        height: height.value - 60,
        rerootCallback: d => filterId.value = d.id,
        getTooltipText: tooltipContent
    } as TreemapSettings;

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
    visualizationObject.value = createTreemap(!isFullscreen.value);
    visualizationObject.value?.reroot(savedFilterId, false);
    filterId.value = savedFilterId;
};

const download = () => {
    console.log("Download");
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

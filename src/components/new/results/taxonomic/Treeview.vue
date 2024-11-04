<template>
    <visualization-controls
        ref="controls"
        caption="Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root"
        :download="download"
        :reset="reset"
        :fullscreen="toggleFullscreen"
        :hide-download="isFullscreen"
    >
        <template #visualization>
            <div
                v-once
                ref="visualization"
                style="height: inherit;"
                class="visualization-container"
            />
        </template>
    </visualization-controls>
</template>

<script setup lang="ts">
import { Treeview as UnipeptTreeview, TreeviewSettings } from 'unipept-visualizations';
import {onMounted, ref, useTemplateRef, watch} from 'vue';
import {NcbiTreeNode} from "unipept-web-components";
import VisualizationControls from "@/components/new/results/taxonomic/VisualizationControls.vue";
import {useElementSize, useFullscreen} from "@vueuse/core";

const props = defineProps<{
    ncbiRoot: NcbiTreeNode
}>();

const controls = useTemplateRef("controls");
const visualization = useTemplateRef("visualization");
const visualizationObject = ref<UnipeptSunburst | undefined>(undefined);

const { isFullscreen, toggle } = useFullscreen(controls);
const { width, height } = useElementSize(controls);

const createTreeview = (fullscreen = false): UnipeptSunburst | undefined => {
    if(!props.ncbiRoot) return;

    const settings = {
        width: width.value,
        height: height.value,
        rerootCallback: d => filterId.value = d.id,
        getTooltipText: tooltipContent
    } as TreeviewSettings;

    const treeview = new UnipeptTreeview(
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

    return treeview;
}

const redraw = () => {
    visualizationObject.value = createTreeview(!isFullscreen.value);
    visualizationObject.value?.reset();
};

const download = () => {
    console.log("Download");
};

const reset = () => {
    visualizationObject.value?.reset();
};

const toggleFullscreen = () => {
    redraw();
    toggle();
};

watch(width, () => {
    redraw();
});

watch(() => props.ncbiRoot, () => {
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
}
</style>

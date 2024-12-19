<template>
    <visualization-controls
        ref="controls"
        caption="Click a slice to zoom in and the center node to zoom out"
        :download="() => downloadImageModalOpen = true"
        :reset="reset"
        :fullscreen="toggleFullscreen"
        :hide-download="isFullscreen"
        :settings="!isFullscreen"
    >
        <template #settings>
            <v-list-item density="compact">
                Sunburst settings
            </v-list-item>
            <v-list-item density="compact">
                <v-checkbox
                    v-model="useFixedColors"
                    label="Use fixed colors"
                    color="primary"
                    density="compact"
                    hide-details
                />
            </v-list-item>
        </template>

        <template #visualization>
            <div
                v-once
                ref="visualization"
                style="height: inherit;"
                class="visualization-container"
            />
        </template>
    </visualization-controls>

    <download-image
        v-model="downloadImageModalOpen"
        :image="svg"
        filename="sunburst"
    />
</template>

<script setup lang="ts">
import { Sunburst as UnipeptSunburst, SunburstSettings } from 'unipept-visualizations';
import {computed, onMounted, ref, useTemplateRef, watch} from 'vue';
import {NcbiTreeNode} from "unipept-web-components";
import VisualizationControls from "@/components/new/results/taxonomic/VisualizationControls.vue";
import {useFullscreen} from "@vueuse/core";
import DownloadImage from "@/components/new/image/DownloadImage.vue";

const props = withDefaults(defineProps<{
    ncbiRoot: NcbiTreeNode
    width?: number
    height?: number
}>(), {
    width: 800,
    height: 500
});

const filterId = defineModel<number>();

const controls = useTemplateRef("controls");
const visualization = useTemplateRef("visualization");
const visualizationObject = ref<UnipeptSunburst | undefined>(undefined);

const useFixedColors = ref(false);
const downloadImageModalOpen = ref(false);

const svg = computed(() => visualizationObject.value?.element.querySelector(":scope > svg"));

const { isFullscreen, toggle } = useFullscreen(controls);

const createSunburst = (fullscreen = false): UnipeptSunburst | undefined => {
    if(!props.ncbiRoot) return;

    const settings = {
        width: props.width,
        height: props.height,
        useFixedColors: useFixedColors.value,
        rerootCallback: d => filterId.value = d.id,
        getTooltipText: tooltipContent
    } as SunburstSettings;

    const sunburst = new UnipeptSunburst(
        visualization.value,
        props.ncbiRoot,
        settings,
    );

    const svgEl = visualization.value?.querySelector("svg");
    if(svgEl) {
        svgEl.setAttribute("width", "100%");
        if (fullscreen) {
            svgEl.setAttribute("height", "100%");
        }
    }

    return sunburst;
}

const redraw = () => {
    const savedFilterId = filterId.value;
    visualizationObject.value = createSunburst(isFullscreen.value);
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

watch(useFixedColors, () => {
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

<style>
.visualization-container {
    display: flex;
    flex-direction: row-reverse;
}

.sunburst {
    display: flex;
    flex-direction: row-reverse;
    width: 100% !important;
}

.unipept-tooltip a {
    color: white;
}

.sunburst:deep(.sunburst-breadcrumbs) {
    margin-top: 75px !important;
}
</style>

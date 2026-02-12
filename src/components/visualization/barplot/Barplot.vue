<template>
    <div class="d-flex flex-row">
        <div
            v-if="props.settings.showBarLabel"
            :style="{ width: barLabelWidth + 'px', minWidth: barLabelWidth + 'px' }"
            class="d-flex flex-column pr-2 label-container pl-6"
        >
            <div
                v-for="(bar, index) in props.bars"
                :key="index"
                class="d-flex align-center bar-label"
                :style="{ height: props.settings.barHeight + 'px' }"
            >
                <span class="text-truncate" :title="bar.label">
                    {{ bar.label }}
                </span>
            </div>
        </div>

        <div
            v-if="props.settings.showBarLabel"
            class="resizer"
            @mousedown="startResizing"
        ></div>

        <div ref="barplotContainer" class="flex-grow-1 barplot-container"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Bar, Barplot, BarplotSettings } from "unipept-visualizations";

const props = withDefaults(
    defineProps<{
        bars: Bar[],
        settings?: BarplotSettings
    }>(), {
        settings: () => new BarplotSettings()
    }
);

const barplotContainer = ref<HTMLElement>();
const barLabelWidth = ref(props.settings.barLabelWidth || 200);

const startResizing = (event: MouseEvent) => {
    const startX = event.clientX;
    const startWidth = barLabelWidth.value;

    const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        barLabelWidth.value = Math.max(50, startWidth + deltaX);
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};

const renderPlot = () => {
    const tooltipElements = document.getElementsByClassName("unipept-tooltip");
    for (let i = 0; i < tooltipElements.length; i++) {
        tooltipElements.item(i)?.remove();
    }

    if (!barplotContainer.value || !props.bars || props.bars.length == 0 || props.settings.width === 0) return;

    // Clone the bars such that we can modify them without updating the data moved into this structure
    let bars = props.bars.map(b => { return { ... b } });

    // Clear any previous renders
    barplotContainer.value.innerHTML = "";

    // Copy settings and disable internal bar labels if we are rendering them ourselves
    const settings = Object.assign(new BarplotSettings(), JSON.parse(JSON.stringify(props.settings)));
    
    // Functions are lost during JSON.parse, so we need to restore them if they were set
    settings.mouseIn = props.settings.mouseIn;
    settings.mouseMove = props.settings.mouseMove;
    settings.mouseOut = props.settings.mouseOut;
    settings.getTooltip = props.settings.getTooltip;
    settings.getTooltipTitle = props.settings.getTooltipTitle;
    settings.getTooltipText = props.settings.getTooltipText;

    if (props.settings.showBarLabel) {
        settings.showBarLabel = false;
        // We also need to adjust the width of the barplot itself because the container width now includes the labels
        settings.width = Math.max(0, props.settings.width - barLabelWidth.value - 12); // 12px for resizer and padding
        settings.chart.padding.left = 0;
    }

    // Render barplot again
    new Barplot(
        barplotContainer.value,
        bars,
        settings
    );
};

onMounted(() => {
    renderPlot();
});

watch([
    () => props.bars,
    () => props.settings.width,
    () => props.settings.height,
    () => props.settings.showBarLabel,
    () => barLabelWidth.value
], () => {
    renderPlot();
});
</script>

<style scoped>
.label-container {
    overflow: hidden;
    user-select: none;
}

.bar-label {
    font-size: 1rem;
    justify-content: flex-end;
    text-align: right;
}

.resizer {
    width: 4px;
    cursor: col-resize;
    background-color: transparent;
    transition: background-color 0.2s;
}

.resizer:hover {
    background-color: #eee;
}

.barplot-container {
    overflow: hidden;
}
</style>
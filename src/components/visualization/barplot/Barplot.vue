<template>
    <div ref="barplotContainer"></div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import {Bar, BarItem, Barplot, BarplotSettings} from "unipept-visualizations";

const props = withDefaults(
    defineProps<{
        bars: Bar[],
        settings?: BarplotSettings
    }>(), {
        settings: () => new BarplotSettings()
    }
);

const barplotContainer = ref<HTMLElement>();

const renderPlot = () => {
    if (!barplotContainer.value || !props.bars || props.bars.length == 0) return;

    // Clone the bars such that we can modify them without updating the data moved into this structure
    let bars = props.bars.map(b => { return { ... b } });

    // Clear any previous renders
    barplotContainer.value.innerHTML = "";

    props.settings.getTooltipText = (x: BarItem) => {
        if (props.settings.displayMode === "absolute") {
            return `${x.counts} peptides`;
        } else {
            return `${x.counts.toFixed(1)}% of peptides`;
        }
    };

    // Render barplot again
    const barplot = new Barplot(
        barplotContainer.value, 
        bars,
        props.settings
    );
};

onMounted(() => {
    renderPlot();
});

watch([
    () => props.bars,
    () => props.settings.width,
    () => props.settings.height
], () => {
    renderPlot();
});
</script>

<style scoped>
</style>
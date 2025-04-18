<template>
    <div ref="barplotContainer"></div>
</template>

<script setup lang="ts">
import {Bar} from "@/components/visualization/barplot/Bar";
import {onMounted, ref, watch} from 'vue';
import * as d3 from 'd3';

const {bars, width, height} = defineProps<{
    bars: Bar[],
    width: number,
    height: number
}>();

const barplotContainer = ref<HTMLElement>();

const renderPlot = () => {
    if (!barplotContainer.value) return;

    // Padding for the whole element (plot + legend)
    const visualizationPadding = {
        left: 10,
        top: 10,
        right: 10,
        bottom: 10
    };

    // Default font for all text in the visualization
    const font = "Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;";

    // Legend specific settings
    const legendFontSize = 12;
    const legendBoxSize = 12;
    // Vertical padding between two successive legend items
    const legendEntryPadding = 5;
    // Horizontal padding between legend colored box and legend label
    const legendBoxLabelPadding = 10;
    const legendTitleFontSize = 20;
    // Padding below the title of the legend
    const legendTitlePadding = 10;
    const legendWidth = 200;

    // Padding for the legend area only
    const legendPadding = {
        left: 10,
        top: 10,
        right: 10,
        bottom: 10
    }

    // Padding for the plot area only
    const plotPadding = {
        left: 10,
        top: 10,
        right: 10,
        bottom: 10
    }

    const barHeight = 75;

    // Computed metrics
    const plotAreaWidth = width - visualizationPadding.left - plotPadding.left - plotPadding.right - legendWidth - visualizationPadding.right;
    const legendContentStartLeft = visualizationPadding.left + plotPadding.left + plotAreaWidth + plotPadding.right + legendPadding.left;
    const legendEntryHeight = Math.max(legendBoxSize, legendFontSize);
    // Max width that a legend label should be
    const maxLegendLabelWidth = legendWidth - legendPadding.left - legendPadding.right - legendBoxSize - legendBoxLabelPadding;

    // Clear previous chart
    d3.select(barplotContainer.value).selectAll("*").remove();

    const svg = d3.select(barplotContainer.value)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    // Prepare data
    const stackedData = d3.stack<Bar, string>()
        .keys(Array.from(new Set(bars.flatMap(bar => bar.items.map(item => item.label)))))
        .value((d, key) => d.items.find(item => item.label === key)?.counts ?? 0)
        (bars);

    // Scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(stackedData, d => d3.max(d, d => d[1])) || 0])
        .range([0, plotAreaWidth]);

    const yScale = d3.scaleBand()
        .domain(bars.map((_, i) => i.toString()))
        .range([0, barHeight * bars.length])
        .paddingInner(0.1)
        .paddingOuter(0);

    const materialDesignColors = [
        "#F44336",    // red
        "#B71C1C",    // red-darken-4
        "#E91E63",    // pink
        "#880E4F",    // pink-darken-4
        "#9C27B0",    // purple
        "#4A148C",    // purple-darken-4
        "#673AB7",    // deep-purple
        "#311B92",    // deep-purple-darken-4
        "#3F51B5",    // indigo
        "#1A237E",    // indigo-darken-4
        "#2196F3",    // blue
        "#006064",    // cyan-darken-4
        "#009688",    // teal
        "#004D40",    // teal-darken-4
        "#4CAF50",    // green
        "#1B5E20",    // green-darken-4
        "#C0CA33",    // lime-darken-1
        "#827717",    // lime-darken-4
        "#FFC107",    // amber
        "#FF6F00",    // amber-darken-4
        "#FF9800",    // orange
        "#E65100",    // orange-darken-4
        "#FF5722",    // deep-orange
        "#BF360C"     // deep-orange-darken-4
    ];

    const colorScale: d3.ScaleOrdinal<string, string, string> = d3.scaleOrdinal<string, string, string>()
        .domain(Array.from(new Set(bars.flatMap(bar => bar.items.map(item => item.label)))))
        .range(materialDesignColors);

    // Add bars
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => colorScale(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => visualizationPadding.left + plotPadding.left + Math.floor(xScale(d[0])))
        .attr("y", (d, i) => visualizationPadding.top + plotPadding.top + (yScale(i.toString()) || 0))
        .attr("width", d => Math.floor(xScale(d[1])) - Math.floor(xScale(d[0])))
        .attr("height", yScale.bandwidth());

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(${visualizationPadding.left + plotPadding.left},${visualizationPadding.top + plotPadding.top + yScale.range()[1]})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("font-family", font)
        .attr("fill", "black")
        .attr("x", plotAreaWidth / 2)
        .attr("y", 35)
        .attr("text-anchor", "start")
        .text("Count");

    // Add legend
    const legend = svg.append("g")
        .attr("font-family", font)
        .attr("font-size", legendFontSize)
        .selectAll("g")
        .data(colorScale.domain())
        .join("g")
        .attr("transform", (_, i) => `translate(0,${i * (legendEntryHeight + legendEntryPadding) + legendTitleFontSize + legendTitlePadding + visualizationPadding.top + legendPadding.top})`);

    // Legend title
    svg.append("text")
        .attr("font-family", font)
        .attr("font-size", legendTitleFontSize)
        .attr("dominant-baseline", "hanging")
        .attr("x", legendContentStartLeft)
        .attr("y", visualizationPadding.top + legendPadding.top)
        .text("Legend");

    // Little colored boxes before each legend item
    legend.append("rect")
        .attr("x", legendContentStartLeft)
        .attr("width", legendBoxSize)
        .attr("height", legendBoxSize)
        .attr("fill", colorScale);

    // Legend labels
    legend.append("text")
        .attr("x", legendContentStartLeft + legendBoxSize + legendBoxLabelPadding)
        .attr("y", legendFontSize / 2)
        .attr("dy", "0.35em")
        .text(d => {
            if (d.length * (legendFontSize * 0.6) > maxLegendLabelWidth) {
                const charsToShow = Math.floor(maxLegendLabelWidth / (legendFontSize * 0.6));
                return d.substring(0, charsToShow - 3) + "...";
            }
            return d;
        });
};

onMounted(() => {
    renderPlot();
});

watch([
    () => bars,
    () => width,
    () => height
], () => {
    renderPlot();
});
</script>

<style scoped>
</style>
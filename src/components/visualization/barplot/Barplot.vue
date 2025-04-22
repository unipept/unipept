<template>
    <div ref="barplotContainer"></div>
</template>

<script setup lang="ts">
import {Bar} from "@/components/visualization/barplot/Bar";
import {onMounted, ref, watch, withDefaults} from 'vue';
import * as d3 from 'd3';
import { BarplotSettings } from "@/components/visualization/barplot/BarplotSettings";

const props = withDefaults(
    defineProps<{
        bars: Bar[],
        settings?: BarplotSettings
    }>(), {
        settings: new BarplotSettings()
    }
);

const barplotContainer = ref<HTMLElement>();

const renderPlot = () => {
    if (!barplotContainer.value || !props.bars) return;

    let bars = props.bars;
    
    if (props.settings.displayMode == "relative") {
        bars = bars.map(bar => {
            const total = bar.items.reduce((sum, item) => sum + item.counts, 0);
            return {
                items: bar.items.map(item => ({
                    label: item.label,
                    counts: (item.counts / total) * 100
                }))
            };
        });
    }

    const width = props.settings.width;
    const height = props.settings.height;

    // Visualization-wide settings
    // Padding for the whole visualization container
    const visualizationPadding = props.settings.padding;

    const font = props.settings.font;

    // Plot settings
    // Padding for the actual plot area
    const plotPadding = props.settings.plot.padding;

    // Height of each bar in the barplot
    const barHeight = props.settings.barHeight;

    const horizontal = props.settings.orientation == "horizontal";

    // Legend settings
    // Padding for the legend area
    const legendPadding = props.settings.legend.padding;

    const legendWidth = props.settings.legend.width;

    const legendTitleFontSize = props.settings.legend.titleFontSize;
    const legendLabelFontSize = props.settings.legend.labelFontSize;

    const legendSymbolSize = props.settings.legend.symbolSize;

    const legendRowSpacing = props.settings.legend.rowSpacing;
    const legendColumnSpacing = props.settings.legend.columnSpacing;

    const legendColumns = props.settings.legend.columns;

    // Padding below the title of the legend
    const legendTitlePaddingBottom = 10;

    // Horizontal padding between legend colored box and legend label
    const legendSymbolPaddingRight = 10;

    // Height of the x-axis bar and it's labels
    const xAxisHeight: number = 35;

    let plotAreaWidth: number;
    let plotAreaHeight: number;
    let legendContentStartLeft: number;
    let legendContentStartTop: number;
    let legendEntryHeight: number;
    let maxLegendLabelWidth: number;
    let legendAreaWidth: number;
    let legendEntryWidth: number;

    // Computed metrics
    if (horizontal) {
        plotAreaWidth = width - visualizationPadding.left - plotPadding.left - plotPadding.right - legendWidth - visualizationPadding.right;
        plotAreaHeight = barHeight * bars.length;
        legendContentStartTop = visualizationPadding.top + legendPadding.top;
        legendContentStartLeft = visualizationPadding.left + plotPadding.left + plotAreaWidth + plotPadding.right + legendPadding.left;
        legendEntryHeight = Math.max(legendSymbolSize, legendLabelFontSize);
        // Max width that a legend label should be
        maxLegendLabelWidth = legendWidth - legendPadding.left - legendPadding.right - legendSymbolSize - legendSymbolPaddingRight;
        legendEntryWidth = legendWidth - legendPadding.left - legendPadding.right;
    } else {
        plotAreaWidth = width - visualizationPadding.left - plotPadding.left - plotPadding.right - visualizationPadding.right;
        plotAreaHeight = barHeight * bars.length;
        legendContentStartTop = visualizationPadding.top + plotAreaHeight + legendPadding.top + xAxisHeight;
        legendContentStartLeft = visualizationPadding.left + legendPadding.left;
        legendEntryHeight = Math.max(legendSymbolSize, legendLabelFontSize);
        legendAreaWidth = width - visualizationPadding.left - legendPadding.left - legendPadding.right - visualizationPadding.right;
        legendEntryWidth = Math.floor((legendAreaWidth - Math.max(legendColumns - 1, 0) * legendColumnSpacing) / legendColumns);
    }

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
        .attr("transform", `translate(${visualizationPadding.left + plotPadding.left}, ${visualizationPadding.top + plotPadding.top + barHeight * bars.length})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("font-family", font)
        .attr("fill", "black")
        .attr("x", plotAreaWidth / 2)
        .attr("y", xAxisHeight)
        .attr("text-anchor", "start")
        .text(props.settings.displayMode === "relative" ? "Percentage" : "Count");

    // Add legend
    const legend = svg.append("g")
        .attr("font-family", font)
        .attr("font-size", legendLabelFontSize)
        .selectAll("g")
        .data(colorScale.domain())
        .join("g")
        .attr("transform", (_, i) => `translate(${(i % legendColumns) * legendEntryWidth + Math.max((i % legendColumns) - 1, 0) * legendColumnSpacing}, ${Math.floor(i / legendColumns) * (legendEntryHeight + legendRowSpacing) + legendTitleFontSize + legendTitlePaddingBottom + legendContentStartTop})`);

    // Legend title
    svg.append("text")
        .attr("font-family", font)
        .attr("font-size", legendTitleFontSize)
        .attr("dominant-baseline", "hanging")
        .attr("x", legendContentStartLeft)
        .attr("y", legendContentStartTop)
        .text("Legend");

    // Little colored boxes before each legend item
    legend.append("rect")
        .attr("x", legendContentStartLeft)
        .attr("width", legendSymbolSize)
        .attr("height", legendSymbolSize)
        .attr("fill", colorScale);

    // Legend labels
    legend.append("text")
        .attr("x", legendContentStartLeft + legendSymbolSize + legendSymbolPaddingRight)
        .attr("y", legendLabelFontSize / 2)
        .attr("dy", "0.35em")
        .text(d => {
            if (d.length * (legendLabelFontSize * 0.6) > maxLegendLabelWidth) {
                const charsToShow = Math.floor(maxLegendLabelWidth / (legendLabelFontSize * 0.6));
                return d.substring(0, charsToShow - 3) + "...";
            }
            return d;
        });
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
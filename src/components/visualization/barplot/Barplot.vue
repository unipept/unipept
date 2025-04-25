<template>
    <div ref="barplotContainer"></div>
</template>

<script setup lang="ts">
import {Bar, BarItem} from "@/components/visualization/barplot/Bar";
import {onMounted, ref, watch} from 'vue';
import * as d3 from 'd3';
import { BarplotSettings } from "@/components/visualization/barplot/BarplotSettings";

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

    if (props.settings.maxItems) {
        // Determine which items are the largest and which should be moved into the "rest" category
        const firstBarItems = [...(bars[0].items)].sort((a, b) => b.counts - a.counts).splice(0, props.settings.maxItems);

        // After sorting out the items of the first bar, make sure that the remaining bars use the same categories
        bars = bars.map(bar => {
            let otherCount = 0;

            const newItems: BarItem[] = [];

            // Count all items in this bar that are not in the first bar
            for (const currentItem of bar.items) {
                if (firstBarItems.findIndex(item => item.label === currentItem.label) >= 0) {
                    newItems.push(currentItem);
                } else {
                    otherCount += currentItem.counts;
                }
            }

            // Sort the current bar's items according to the order of the first bar
            const sortedBarItems = newItems.sort((a, b) => {
                const aIndex = firstBarItems.findIndex(item => item.label === a.label);
                const bIndex = firstBarItems.findIndex(item => item.label === b.label);

                return aIndex - bIndex;
            });

            return {
                label: bar.label,
                items: [
                    ...sortedBarItems,
                    {label: "Other", counts: otherCount}
                ]
            };
        });
    }

    // Convert the absolute counts to relative percentages if required
    if (props.settings.displayMode == "relative") {
        bars = bars.map(bar => {
            const total = bar.items.reduce((sum, item) => sum + item.counts, 0);
            return {
                label: bar.label,
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
    const xAxisHeight: number = 40;

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

    let barLabelWidth = 150;
    const barLabelFontSize = 15;
    const barLabelPaddingRight = 10;

    let barWidth = plotAreaWidth;

    if (props.settings.showBarLabel) {
        barWidth = plotAreaWidth - barLabelWidth - barLabelPaddingRight;
    } else {
        barLabelWidth = 0;
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
        .range([0, barWidth]);

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

    // Color for the "other" class in the labels
    const otherColor = "#9E9E9E";

    if (props.settings.maxItems) {
        materialDesignColors[props.settings.maxItems % (bars[0].items.length + 1)] = otherColor;
    }

    const colorScale: d3.ScaleOrdinal<string, string, string> = d3.scaleOrdinal<string, string, string>()
        .domain(Array.from(new Set(bars.flatMap(bar => bar.items.map(item => item.label)))))
        .range(materialDesignColors);

    if (props.settings.showBarLabel) {
        // Add bar labels
        svg.append("g")
            .attr("class", "barLabels")
            .selectAll("text")
            .data(bars)
            .join("text")
            .attr("x", visualizationPadding.left + plotPadding.left)
            .attr("y", (_, i) => visualizationPadding.top + plotPadding.top + (yScale(i.toString()) || 0) + yScale.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("font-family", font)
            .attr("font-size", barLabelFontSize)
            .text(d => {
                if (d.label.length * (barLabelFontSize * 0.6) > barLabelWidth) {
                    const charsToShow = Math.floor(barLabelWidth / (barLabelFontSize * 0.6));
                    return d.label.substring(0, charsToShow - 3) + "...";
                }
                return d.label;
            });
    }

    // Add bars
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => colorScale(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => visualizationPadding.left + plotPadding.left + barLabelWidth + barLabelPaddingRight + Math.floor(xScale(d[0])))
        .attr("y", (d, i) => visualizationPadding.top + plotPadding.top + (yScale(i.toString()) || 0))
        .attr("width", d => Math.floor(xScale(d[1])) - Math.floor(xScale(d[0])))
        .attr("height", yScale.bandwidth());

    if (props.settings.showValuesInBars) {
        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("g")
            .selectAll("text")
            .data(d => d)
            .join("text")
            .attr("x", d => {
                const barStart = Math.floor(xScale(d[0]));
                const barEnd = Math.floor(xScale(d[1]));
                return visualizationPadding.left + plotPadding.left + barLabelWidth + barLabelPaddingRight + barStart + (barEnd - barStart) / 2;
            })
            .attr("y", (d, i) => visualizationPadding.top + plotPadding.top + (yScale(i.toString()) || 0) + yScale.bandwidth() / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-family", font)
            .attr("font-size", props.settings.valuesFontSize)
            .text(d => {
                const value = d[1] - d[0];
                const width = Math.floor(xScale(d[1])) - Math.floor(xScale(d[0]));
                if (width < 30) return "";
                return props.settings.displayMode === "relative" ? `${value.toFixed(1)}%` : value;
            });
    }

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(${visualizationPadding.left + plotPadding.left + barLabelWidth + barLabelPaddingRight}, ${visualizationPadding.top + plotPadding.top + barHeight * bars.length})`)
        .call(d3.axisBottom(xScale))
        .attr("font-size", "12px") // Increase tick label size
        .append("text")
        .attr("font-family", font)
        .attr("fill", "black")
        .attr("x", barWidth / 2)
        .attr("y", xAxisHeight)
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
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
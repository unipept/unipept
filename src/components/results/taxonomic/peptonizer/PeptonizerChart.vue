<template>
    <div>
        <div class="mr-4">
            <h2>Peptonizer Results</h2>
            <div>
                These are the top 20 taxa at the {{ rank }} level.
                The confidence score indicates the estimated probability that the taxon was present in the sample.
                See the publication by <a
                    href="https://doi.org/10.1101/2024.05.20.594958"
                    target="_blank"
                >Holstein et al. (2024) BioRXiv</a> for more information.
            </div>
        </div>

        <v-alert
            v-if="usesDefaultScores"
            variant="tonal"
            type="info"
            class="my-2"
        >
            No peptide scores provided.
            Peptonizer 2000 has used default values instead.
            This may impact the accuracy of your analysis results.
            For optimal performance, please provide scores from your search engine using the
            <a
                class="alert-link"
                @click=""
            >sample management dialog</a>.
        </v-alert>
        <v-alert
            v-else
            variant="tonal"
            type="success"
            class="my-2"
        >
            Custom peptide scores provided.
            Peptonizer 2000 will use these scores for analysis, which typically improves result accuracy.
            Ensure the scores are correctly derived from your search engine for optimal performance.
        </v-alert>

        <div ref="chartContainer" class="chart-container"></div>

        <div
            v-if="tooltip.visible"
            class="chart-tooltip"
            :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
        >
            <div class="chart-tooltip-title">{{ tooltip.key }}</div>
            Confidence: <b>{{ tooltip.value }}</b>
        </div>
    </div>
</template>

<script setup lang="ts">
import {PeptonizerResult} from "peptonizer";
import { onMounted, ref, watch, onUnmounted } from "vue";
import * as d3 from 'd3';

const props = defineProps<{
    rank: string,
    usesDefaultScores: boolean,
    peptonizerResult: PeptonizerResult
}>();

const BAR_COLOR = "#1976D2";
const BAR_COLOR_HOVER = "#1565C0";

const chartContainer = ref<HTMLElement | null>(null);
const tooltip = ref({ visible: false, x: 0, y: 0, key: "", value: "" });

let resizeObserver: ResizeObserver | null = null;
let resizeTimer: ReturnType<typeof setTimeout> | null = null;

const truncateLabel = (node: SVGTextElement, text: string, maxWidth: number): string => {
    node.textContent = text;
    if (node.getComputedTextLength() <= maxWidth) return text;
    let lo = 0, hi = text.length;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        node.textContent = text.slice(0, mid) + "...";
        if (node.getComputedTextLength() <= maxWidth) lo = mid;
        else hi = mid - 1;
    }
    return text.slice(0, lo) + "...";
};

const drawChart = () => {
    if (!chartContainer.value || !props.peptonizerResult) return;

    const data = Array.from(props.peptonizerResult.entries())
        .map(([key, value]) => ({ key, value: parseFloat(value.toFixed(2)) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 20);

    const margin = { top: 30, right: 50, bottom: 50, left: 200 };
    const width = (chartContainer.value.clientWidth || 800) - margin.left - margin.right;
    const height = Math.max(200, data.length * 22);

    d3.select(chartContainer.value).selectAll("*").remove();

    const svg = d3.select(chartContainer.value)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
    const y = d3.scaleBand().range([0, height]).domain(data.map(d => d.key)).padding(0.05);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "12px");

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("font-size", "14px")
        .text("Confidence Score");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Confidence Scores");

    svg.selectAll(".grid-line")
        .data(d3.range(0.05, 1.01, 0.05))
        .join("line")
        .attr("class", "grid-line")
        .attr("x1", d => x(d))
        .attr("x2", d => x(d))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#d0d0d0")
        .attr("stroke-width", 1);

    const yAxis = svg.append("g").call(d3.axisLeft(y));

    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${-margin.left + 15},${height / 2}) rotate(-90)`)
        .style("font-size", "14px")
        .text("Taxon");

    // Truncate labels that overflow the available margin space
    const maxLabelWidth = margin.left - 40;
    yAxis.selectAll<SVGTextElement, string>("text")
        .style("font-size", "12px")
        .each(function(text) {
            const truncated = truncateLabel(this, text, maxLabelWidth);
            if (truncated !== text) d3.select(this).append("title").text(text);
        });

    const barHeight = y.bandwidth() / 2;
    svg.selectAll(".bar")
        .data(data)
        .join("rect")
        .attr("class", "bar")
        .attr("x", x(0))
        .attr("y", d => y(d.key)! + y.bandwidth() / 4)
        .attr("width", d => x(d.value))
        .attr("height", barHeight)
        .attr("fill", BAR_COLOR)
        .on("mouseover", function(_event, d) {
            tooltip.value = { visible: true, x: 0, y: 0, key: d.key, value: d.value.toFixed(2) };
            d3.select(this).attr("fill", BAR_COLOR_HOVER);
        })
        .on("mousemove", function(event) {
            tooltip.value.x = event.clientX + 15;
            tooltip.value.y = event.clientY + 15;
        })
        .on("mouseleave", function() {
            tooltip.value.visible = false;
            d3.select(this).attr("fill", BAR_COLOR);
        });

    svg.selectAll(".bar-label")
        .data(data)
        .join("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.value) + 5)
        .attr("y", d => y(d.key)! + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .style("font-size", "11px")
        .text(d => d.value.toFixed(3));
};

onMounted(() => {
    drawChart();
    if (chartContainer.value) {
        resizeObserver = new ResizeObserver(() => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(drawChart, 200);
        });
        resizeObserver.observe(chartContainer.value);
    }
});

onUnmounted(() => {
    resizeObserver?.disconnect();
    if (resizeTimer) clearTimeout(resizeTimer);
});

watch(() => props.peptonizerResult, drawChart);
</script>

<style scoped>
.chart-container {
    width: 100%;
    min-height: 200px;
}
.chart-tooltip {
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 4px;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-size: 14px;
}
.chart-tooltip-title {
    font-weight: bold;
    margin-bottom: 4px;
    font-size: 13px;
}
</style>

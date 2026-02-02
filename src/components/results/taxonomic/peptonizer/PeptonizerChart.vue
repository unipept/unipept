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
            v-if="tooltipVisible"
            class="chart-tooltip"
            :style="{ top: tooltipY + 'px', left: tooltipX + 'px' }"
        >
            Confidence: <b>{{ tooltipValue }}</b>
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

const chartContainer = ref<HTMLElement | null>(null);
const tooltipVisible = ref(false);
const tooltipX = ref(0);
const tooltipY = ref(0);
const tooltipValue = ref("");

let resizeObserver: ResizeObserver | null = null;

const drawChart = () => {
    if (!chartContainer.value || !props.peptonizerResult) return;

    // Data processing
    const entries = Array.from(props.peptonizerResult.entries())
        .map(([key, value]) => ({ key, value: parseFloat(value.toFixed(2)) }));
    // Sort descending by value
    entries.sort((a, b) => b.value - a.value);
    // Take top 20
    const data = entries.slice(0, 20);

    // Dimensions
    const margin = { top: 30, right: 50, bottom: 50, left: 150 };
    const containerWidth = chartContainer.value.clientWidth || 800;
    const width = containerWidth - margin.left - margin.right;
    const height = Math.max(500, data.length * 30); // Ensure minimum height

    // Clear previous
    d3.select(chartContainer.value).selectAll("*").remove();

    const svg = d3.select(chartContainer.value)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis
    const x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "12px");

    // X axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .style("font-size", "14px")
        .text("Confidence Score");

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Confidence Scores");

    // Y axis
    const y = d3.scaleBand()
        .range([0, height])
        .domain(data.map(d => d.key))
        .padding(0.2);

    // Y axis with truncation for long labels
    const yAxis = svg.append("g")
        .call(d3.axisLeft(y));

    yAxis.selectAll("text")
        .style("font-size", "12px")
        .each(function(d: any) {
            const self = d3.select(this);
            const text = d as string;
            // Simple truncation logic if needed, but margin is generous
            if (text.length > 20) {
                self.text(text.substring(0, 17) + "...");
                self.append("title").text(text);
            }
        });

    // Bars
    svg.selectAll("myRect")
        .data(data)
        .join("rect")
        .attr("x", x(0))
        .attr("y", d => y(d.key)!)
        .attr("width", d => x(d.value))
        .attr("height", y.bandwidth())
        .attr("fill", "#1976D2") // Vuetify primary blueish
        .on("mouseover", function(event, d) {
             tooltipVisible.value = true;
             tooltipValue.value = d.value.toFixed(2);
             d3.select(this).attr("fill", "#1565C0"); // Darker blue
        })
        .on("mousemove", function(event) {
             tooltipX.value = event.clientX + 15;
             tooltipY.value = event.clientY + 15;
        })
        .on("mouseleave", function() {
             tooltipVisible.value = false;
             d3.select(this).attr("fill", "#1976D2");
        });

    // Value labels on bars
    svg.selectAll("myLabel")
        .data(data)
        .join("text")
        .attr("x", d => x(d.value) + 5)
        .attr("y", d => y(d.key)! + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .style("font-size", "11px")
        .text(d => d.value.toFixed(3));
}

onMounted(() => {
    drawChart();
    if (chartContainer.value) {
        resizeObserver = new ResizeObserver(() => {
             drawChart();
        });
        resizeObserver.observe(chartContainer.value);
    }
});

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
});

watch(() => props.peptonizerResult, drawChart, { deep: true });
</script>

<style scoped>
.chart-container {
    width: 100%;
    min-height: 500px;
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
</style>
<template>
    <div>
        <visualization-controls
            caption="Hover over the cells to see more details"
            :settings="true"
            :download="() => downloadImageModalOpen = true"
        >
            <template #settings>
                <v-list-item>
                    Heatmap settings
                </v-list-item>
                <v-list-item>
                    <v-checkbox
                        v-model="useAbsoluteValues"
                        label="Use absolute peptide counts"
                        color="primary"
                        density="compact"
                        hide-details
                    />
                </v-list-item>
            </template>

            <template #visualization>
                <div ref="heatmapWrapper" class="mx-4 mb-4" style="padding-top: 50px;">
                    <div class="d-flex mb-1">
                        <div ref="heatmapContainer">
                        </div>

                        <!-- Controls to the right of the visualization -->
                        <div>
                            <div style="height: 150px;"></div>
                            <v-hover v-for="i in 10"  :key="i">
                                <template v-slot:default="{ isHovering, props: hooveringProps }">
                                    <v-tooltip text="Remove row from heatmap" location="right" open-delay="0">
                                        <template v-slot:activator="{ props: tooltipProps }">
                                            <div v-bind="hooveringProps" style="height: 50px; margin-bottom: 5px; margin-left: 10px; cursor: pointer;" class="d-flex align-center" @mouseenter="enableGhostRow(i - 1)" @mouseleave="disableGhostRow(i - 1)">
                                                <v-icon v-bind="tooltipProps" :color="isHovering ? 'error' : 'grey-lighten-2'" style="transition: color 0.3s">
                                                    mdi-minus-circle-outline
                                                </v-icon>
                                            </div>
                                        </template>
                                    </v-tooltip>
                                </template>
                            </v-hover>
                        </div>
                    </div>


                    <div style="width: 575px;" class="d-flex">
                        <div style="width: 250px;"></div>
                        <v-btn color="primary" style="width: 325px;" variant="tonal" size="small">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </div>
                </div>
            </template>
        </visualization-controls>
    </div>

    <download-image
        v-if="svg"
        v-model="downloadImageModalOpen"
        :image="svg"
        filename="heatmap"
    />
</template>

<script setup lang="ts">
import VisualizationControls from "@/components/results/taxonomic/VisualizationControls.vue";
import {nextTick, onMounted, Ref, ref, watch} from "vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import * as d3 from 'd3';
import DownloadImage from "@/components/image/DownloadImage.vue";
import {useDebounceFn} from "@vueuse/core";

const useAbsoluteValues = ref(false);

const downloadImageModalOpen = ref(false);

const svg: Ref<SVGElement | undefined | null> = ref();

const props = defineProps<{
    analyses: SingleAnalysisStore[]
}>();

const heatmapContainer = ref<HTMLElement>();

const settings = {
    width: 575,
    height: 1000,
    headerHeight: 150,
    rowLabelWidth: 250,
    labelVisSpacing: 10,
    labelFontSize: 16,
    labelColor: "#353535",
    cellSize: 50,
    cellSpacing: 5,
    minColor: "#EEEEEE",
    maxColor: "#2196F3",
    className: "unipept-heatmap"
}

const enableGhostRow = (rowIdx: number) => {
    d3.selectAll("g[data-row-item='" + rowIdx + "']").classed("ghost", true);
    d3.selectAll("text[data-row-label='" + rowIdx + "']").classed("ghost", true);
}

const disableGhostRow = (rowIdx: number) => {
    d3.selectAll("g[data-row-item='" + rowIdx + "']").classed("ghost", false);
    d3.selectAll("text[data-row-label='" + rowIdx + "']").classed("ghost", false);
}

const enableHighlightCell = (currentCell: HTMLElement, rowIdx: number, colIdx: number) => {
    d3.selectAll(".unipept-heatmap .cell").classed("ghost", true);
    d3.select(currentCell).classed("ghost", false);
    d3.select(currentCell).classed("highlighted-cell", true);

    d3.selectAll(".unipept-heatmap .row-label").classed("ghost", true);
    d3.selectAll("text[data-row-label='" + rowIdx + "']").classed("ghost", false);

    d3.selectAll(".unipept-heatmap .header-label").classed("ghost", true);
    d3.selectAll("text[data-col-label='" + colIdx + "']").classed("ghost", false);
}

const disableHighlightCell = (currentCell: HTMLElement, rowIdx: number, colIdx: number) => {
    d3.selectAll(".unipept-heatmap .cell").classed("ghost", false);
    d3.selectAll(".unipept-heatmap .row-label").classed("ghost", false);
    d3.selectAll(".unipept-heatmap .header-label").classed("ghost", false);
    d3.select(".unipept-heatmap .highlighted-cell").classed("highlighted-cell", false);
}

const renderHeatmap = () => {
    // Temporary generate 10 random rows with data that can be used for the heatmap visualization
    const randomRows = [];
    for (let i = 0; i < 10; i++) {
        const row = [];
        for (let j = 0; j < props.analyses.length; j++) {
            row.push(Math.random());
        }
        randomRows.push(row);
    }
    
    const randomRowNames = [
        "Escherichia coli",
        "Staphylococcus aureus",
        "Bacillus subtilis",
        "Salmonella enterica",
        "Pseudomonas aeruginosa",
        "Streptococcus pneumoniae",
        "Mycobacterium tuberculosis",
        "Lactobacillus acidophilus",
        "Clostridium difficile",
        "Helicobacter pylori"
    ];

    const colorInterpolator = d3.interpolateLab(d3.lab(settings.minColor), d3.lab(settings.maxColor));

    const computedTotalHeight = settings.headerHeight + settings.cellSize * randomRows.length + settings.cellSpacing * (randomRows.length - 1);

    // Clear the heatmap container
    d3.select(heatmapContainer.value!)
    .selectAll("*")
    .remove();

    const svg = d3.select(heatmapContainer.value!)
        .append("svg")
        .classed(settings.className, true)
        .attr("version", "1.1")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("viewBox", `0 0 ${settings.width} ${computedTotalHeight}`)
        .attr("width", settings.width)
        .attr("height", computedTotalHeight)
        .attr("overflow", "hidden")
        .attr("font-family", `"Roboto", "Helvetica", sans-serif;`);

    svg
        .append("defs")
        .append("style")
        .attr("type", "text/css")
        .text(
            `
            @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

            text {
                font-family: "Roboto", sans-serif;
            }
            `
        );

    // Render the column labels
    const headerContainer = svg.append("g")
        .attr("transform", `translate(${settings.rowLabelWidth}, 0)`);

    headerContainer
        .append("g")
        .selectAll("text")
        .data(props.analyses.map(a => a.name))
        .join("text")
        .attr("font-size", settings.labelFontSize)
        .attr("font-weight", 500)
        .attr("fill", settings.labelColor)
        .classed("header-label", true)
        .attr("data-col-label", (d, i) => i)
        .text(d => {
            // Use cosine to compute the max length of the slanted labels in the header. Cos(45 degrees) = 0.70
            const maxLength = Math.floor(settings.headerHeight / 0.71) - settings.labelVisSpacing;

            if (d.length * (settings.labelFontSize * 0.6) > maxLength) {
                const charsToShow = Math.floor(maxLength / (settings.labelFontSize * 0.6));
                return d.substring(0, charsToShow - 3) + "...";
            }
            return d
        })
        .attr("text-anchor", "end")
        .attr("x", (d, i) => i * (settings.cellSize + settings.cellSpacing) + settings.cellSize / 2)
        .attr("y", settings.headerHeight - settings.labelVisSpacing)
        .attr("dy", ".35em")
        .attr("transform", (d, i) => `rotate(45, ${i * (settings.cellSize + settings.cellSpacing) + settings.cellSize / 2}, ${settings.headerHeight - settings.labelVisSpacing})`);
    
    // Render the row labels
    const rowLabelContainer = svg.append("g");

    rowLabelContainer
        .selectAll("text")
        .data(randomRowNames)
        .join("text")
        .attr("font-size", settings.labelFontSize)
        .attr("font-weight", 500)
        .attr("fill", settings.labelColor)
        .text(d => {
            const maxWidth = settings.rowLabelWidth - settings.labelVisSpacing;
            if (d.length * (settings.labelFontSize * 0.6) > maxWidth) {
                const charsToShow = Math.floor(maxWidth / (settings.labelFontSize * 0.6));
                return d.substring(0, charsToShow - 3) + "...";
            }
            return d
        })
        .attr("text-anchor", "end")
        .attr("x", settings.rowLabelWidth - settings.labelVisSpacing)
        .attr("y", (d, i) => i * (settings.cellSize + settings.cellSpacing) + settings.headerHeight + settings.cellSize / 2)
        .attr("dy", ".35em")
        .attr("data-row-label", (d, i) => i)
        .classed("row-label", true);

    const visualizationContainer = svg.append("g")
        .attr("transform", `translate(${settings.rowLabelWidth}, ${settings.headerHeight})`);

    // Render the samples as columns for the heatmap
    const rows = visualizationContainer
        .selectAll("g")
        .data(randomRows)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * (settings.cellSize + settings.cellSpacing)})`)
        .attr("data-row-item", (d, i) => i);

    rows.selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("width", settings.cellSize)
        .attr("height", settings.cellSize)
        .attr("x", (d, i) => i * (settings.cellSize + settings.cellSpacing))
        .attr("y", 0)
        .attr("rx", 4)
        .attr("fill", (d) => colorInterpolator(d))
        .attr("data-col-item", (d, i) => i)
        .classed("cell", true);

    // Then add invisible, slightly larger rectangles on top for the mouse events
    rows.selectAll(".cell-overlay")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("width", settings.cellSize + 10) // 5px padding on each side
        .attr("height", settings.cellSize + 10) // 5px padding on each side
        .attr("x", (d, i) => i * (settings.cellSize + settings.cellSpacing) - 5) // Center the overlay
        .attr("y", -5) // Center the overlay
        .attr("fill", "transparent") // Make it invisible
        .attr("pointer-events", "all") // Ensure it captures mouse events
        .attr("data-col-item", (d, i) => i)
        .on("mouseover", (event: MouseEvent, d: any) => {
            // Find the corresponding visible cell
            const overlay = event.target as HTMLElement;
            const colIdx = parseInt(overlay.getAttribute("data-col-item")!);
            const rowIdx = parseInt(overlay.parentElement!.getAttribute("data-row-item")!);
            const cell = overlay.parentElement!.querySelector(`.cell[data-col-item="${colIdx}"]`) as HTMLElement;

            enableHighlightCell(cell, rowIdx, colIdx);
        })
        .on("mouseleave", (event: MouseEvent, d: any) => {
            // Find the corresponding visible cell
            const overlay = event.target as HTMLElement;
            const colIdx = parseInt(overlay.getAttribute("data-col-item")!);
            const rowIdx = parseInt(overlay.parentElement!.getAttribute("data-row-item")!);
            const cell = overlay.parentElement!.querySelector(`.cell[data-col-item="${colIdx}"]`) as HTMLElement;

            disableHighlightCell(cell, rowIdx, colIdx);
        });

};

onMounted(() => {
    renderHeatmap();
});

watch(() => props.analyses, () => {
    renderHeatmap();
});

watch(() => props.analyses, async () => {
    await nextTick();
    svg.value = heatmapContainer.value?.querySelector("svg") as SVGElement;
}, { immediate: true });
</script>

<style>
.unipept-heatmap .ghost {
    opacity: 0.25;
    transition: opacity 0.2s ease-in-out;
}

.unipept-heatmap .highlighted-cell {
    stroke-width: 2px;
    stroke: gray;
}
</style>

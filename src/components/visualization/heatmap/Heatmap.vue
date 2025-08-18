<template>
    <div class="d-flex">
        <div ref="heatmapContainer">
        </div>

        <v-tooltip
            :model-value="tooltipActive"
            :target="[tooltipPosition.x, tooltipPosition.y]"
            :offset="20"
            location="right"
        >
            <slot
                name="tooltip-content"
                :selected-row="highlightedCell.rowIdx"
                :selected-col="highlightedCell.colIdx"
            />
        </v-tooltip>

        <!-- Controls to the right of the visualization -->
        <div>
            <div :style="`height: ${colLabelHeight}px;`"></div>
            <v-hover v-for="(rowName, i) in rowNames" :key="rowName">
                <template v-slot:default="{ isHovering, props: hooveringProps }">
                    <v-tooltip text="Remove row from heatmap" location="right" open-delay="0">
                        <template v-slot:activator="{ props: tooltipProps }">
                            <div
                                v-bind="hooveringProps"
                                :style="`height: ${cellSize}px; margin-bottom: ${cellSpacing}px; cursor: pointer;`"
                                class="d-flex align-center"
                                @click="deleteRow(i)"
                                @mouseenter="ghostRow(i)"
                                @mouseleave="stopGhostingRow(i)"
                            >
                                <v-icon
                                    v-bind="tooltipProps"
                                    :color="isHovering ? 'error' : 'grey-lighten-2'"
                                    style="transition: color 0.2s"
                                >
                                    mdi-delete-outline
                                </v-icon>
                            </div>
                        </template>
                    </v-tooltip>
                </template>
            </v-hover>
        </div>
    </div>

    <div :style="`width: ${containerWidth}px;`" class="d-flex">
        <div :style="`width: ${rowLabelWidth}px;`">
        </div>
        <v-menu location="right top" :close-on-content-click="false" :offset="12">
            <template v-slot:activator="{ props }">
                <v-btn
                    color="primary"
                    v-bind="props"
                    :style="`width: ${containerWidth - rowLabelWidth - labelSpacing}px;`"
                    size="small"
                    variant="elevated"
                    @click="addRows()"
                    prepend-icon="mdi-plus"
                    text="Add species"
                >
                </v-btn>
            </template>
            <slot name="row-selector"></slot>
        </v-menu>
    </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3';
import {computed, ComputedRef, onMounted, Ref, ref, watch} from "vue";
import {useDebounce, useDebounceFn} from "@vueuse/core";

const {
    data,
    rowNames,
    colNames,
    showCellLabels = true,
    cellSize = 45,
    cellSpacing = 4,
    cellFontSize = 10,
    labelSpacing = 10,
    labelFontSize = 14,
    labelFontFamily = "Roboto, sans-serif",
    labelFontWeight = "500",
    labelColor = "#353535",
    minColor = "#EEEEEE",
    maxColor = "#2196F3",
    selectedStrokeColor = "black",
    showTooltips = true,
    tooltipDelay = 500
} = defineProps<{
    // All cells (with a value between 0 and 1) that should be rendered in the heatmap.
    data: { value: number, label: string | undefined }[][],
    // Names of all the rows that are displayed in the heatmap.
    rowNames: string[],
    // Names of all the columns that are displayed in the heatmap.
    colNames: string[],
    // Show value labels inside each cell
    showCellLabels?: boolean,
    // Width and height of a single cell of the heatmap in pixels.
    cellSize?: number,
    // Spacing (in pixels) between successive cells in the heatmap (both horizontally and vertically).
    cellSpacing?: number,
    // Font size of the labels rendered inside the cells
    cellFontSize?: number,
    // Spacing (in pixels) between labels and the visualization (both for the rows and columns)
    labelSpacing?: number,
    // Font size (in pixels) for all labels in the visualization.
    labelFontSize?: number,
    // Font family used for all labels in the visualization
    labelFontFamily?: string,
    // Weight used for all labels in the visualization
    labelFontWeight?: string,
    // Text color of all labels in the visualization
    labelColor?: string,
    // Fill color of cells corresponding to value 0.0
    minColor?: string,
    // Fill color of cells corresponding to value 1.0
    maxColor?: string,
    // Color of the stroke of a selected cell. Should ideally be a bit darker than the maxColor.
    selectedStrokeColor?: string,
    // Show tooltips on hover?
    showTooltips?: boolean,
    // Before open delay of the tooltip
    tooltipDelay?: number,
}>();

const emits = defineEmits<{
    (e: 'deselect-row', rowIdx: number): void;
    (e: 'deselect-col', colIdx: number): void;
    (e: 'select-rows'): void;
    (e: 'select-cols'): void;
}>();

const className: string = "unipept-heatmap";

const tooltipActive: Ref<boolean> = ref(false);
const tooltipPosition: Ref<{ x: number, y: number }> = ref({ x: 0, y: 0 });
const highlightedCell: Ref<{ rowIdx: number, colIdx: number }> = ref({
    rowIdx: -1,
    colIdx: -1
});
const selectedCell = defineModel("selected-cell", { default: { rowIdx: -1, colIdx: -1 } });

const heatmapContainer = ref<HTMLElement>();

/**
 * Finds the longest label and returns it's length (unless it's too long, a maximum of 200 px will be used then). By
 * computing this dynamically, the visualization will be less wide for short labels instead of always having a fixed
 * width.
 */
const rowLabelWidth: ComputedRef<number> = computed(() => {
    if (rowNames.length === 0) {
        return 250;
    }

    return Math.min(
        Math.max(...rowNames.map((name: string) => computeTextWidth(name, labelFontSize, labelFontFamily, labelFontWeight))) + 2 * labelSpacing,
        250
    );
});

const colLabelHeight: ComputedRef<number> = computed(() => {
    return Math.min(
        Math.max(...colNames.map((name: string) => computeTextWidth(name, labelFontSize, labelFontFamily, labelFontWeight))) * Math.cos((1 / 4) * Math.PI) + 2 * labelSpacing,
        200
    );
});

const containerWidth = computed(() => {
    return rowLabelWidth.value + labelSpacing + colNames.length * cellSize + (colNames.length - 1) * cellSpacing;
});

const containerHeight = computed(() => {
    // Add 2 pixels for the cell highlight stroke width
    return colLabelHeight.value + rowNames.length * cellSize + (rowNames.length - 1) * cellSpacing + 2;
});

const colorInterpolator = d3.interpolateLab(d3.lab(minColor), d3.lab(maxColor));

const deleteRow = (rowIdx: number) => {
    emits("deselect-row", rowIdx);
}

const addRows = () => {
    emits("select-rows");
}

/**
 * Make this row appear as a "ghost" (i.e. make it semi-invisible).
 * @param rowIdx
 */
const ghostRow = (rowIdx: number) => {
    d3.selectAll("g[data-row-item='" + rowIdx + "']").classed("ghost", true);
    d3.selectAll("text[data-row-label='" + rowIdx + "']").classed("ghost", true);
}

/**
 * Disable the ghost appearance of this row.
 * @param rowIdx
 */
const stopGhostingRow = (rowIdx: number) => {
    d3.selectAll("g[data-row-item='" + rowIdx + "']").classed("ghost", false);
    d3.selectAll("text[data-row-label='" + rowIdx + "']").classed("ghost", false);
}

const highlightCell = (cellOverlay: HTMLElement, rowIdx: number, colIdx: number) => {
    d3.selectAll(".unipept-heatmap .cell").classed("ghost", true);

    const cellItem = cellOverlay.parentElement!.querySelector(`rect[data-col-item="${colIdx}"]`) as HTMLElement;
    const cellText = cellOverlay.parentElement!.querySelector(`text[data-col-item="${colIdx}"]`) as HTMLElement;

    d3.select(cellItem).classed("ghost", false);
    d3.select(cellText).classed("ghost", false);
    d3.select(cellItem).classed("highlighted-cell", true);

    d3.selectAll(".unipept-heatmap .row-label").classed("ghost", true);
    d3.selectAll("text[data-row-label='" + rowIdx + "']").classed("ghost", false);

    d3.selectAll(".unipept-heatmap .header-label").classed("ghost", true);
    d3.selectAll("text[data-col-label='" + colIdx + "']").classed("ghost", false);
}

const stopHighlightingCell = (cellOverlay: HTMLElement, rowIdx: number, colIdx: number) => {
    d3.selectAll(".unipept-heatmap .cell").classed("ghost", false);
    d3.selectAll(".unipept-heatmap .row-label").classed("ghost", false);
    d3.selectAll(".unipept-heatmap .header-label").classed("ghost", false);
    d3.select(".unipept-heatmap .highlighted-cell").classed("highlighted-cell", false);
}

const selectCell = (currentCell: HTMLElement, rowIdx: number, colIdx: number) => {
    d3.selectAll(".unipept-heatmap .cell").classed("selected-cell", false);
    d3.selectAll(".unipept-heatmap .row-label").classed("selected-label", false);
    d3.selectAll(".unipept-heatmap .header-label").classed("selected-label", false);

    d3.select(currentCell).classed("selected-cell", true);

    d3.selectAll("text[data-row-label='" + rowIdx + "']").classed("selected-label", true);
    d3.selectAll("text[data-col-label='" + colIdx + "']").classed("selected-label", true);


    selectedCell.value = { rowIdx, colIdx };
}

const stopSelectedCell = () => {
    d3.selectAll(".unipept-heatmap .cell").classed("selected-cell", false);
    d3.selectAll(".unipept-heatmap .row-label").classed("selected-label", false);
    d3.selectAll(".unipept-heatmap .header-label").classed("selected-label", false);
    selectedCell.value = { rowIdx: -1, colIdx: -1 };
}

let tooltipTimeout: NodeJS.Timeout | undefined;

const showTooltip = (event: MouseEvent, rowIdx: number, colIdx: number) => {
    tooltipPosition.value.x = event.clientX;
    tooltipPosition.value.y = event.clientY;

    highlightedCell.value.rowIdx = rowIdx;
    highlightedCell.value.colIdx = colIdx;

    tooltipTimeout = setTimeout(() => tooltipActive.value = showTooltips, tooltipDelay);
}

const moveTooltip = (event: MouseEvent) => {
    tooltipPosition.value.x = event.clientX;
    tooltipPosition.value.y = event.clientY;
}

const hideTooltip = () => {
    if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = undefined;
    }

    tooltipActive.value = false;
}

const computeTextWidth = (
    text: string,
    fontSize: number,
    fontFamily: string,
    fontWeight: string = "normal"
) => {
    // Create a canvas context
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        console.error('Could not get canvas context');
        return 0;
    }

    // Set the font properties
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

    // Measure the text
    const metrics = context.measureText(text);

    return metrics.width;
}

const ellipsizeString = (
    text: string,
    fontSize: number,
    fontFamily: string,
    fontWeight: string,
    maxLength: number
) => {
    const labelLength = computeTextWidth(text, fontSize, fontFamily, fontWeight);

    if (labelLength > maxLength) {
        const charsToShow = (maxLength / labelLength) * text.length;
        return text.substring(0, charsToShow - 3) + "...";
    }

    return text;
}

const renderHeatmap = () => {
    // Clear the heatmap container
    d3.select(heatmapContainer.value!)
        .selectAll("*")
        .remove();

    const svg = d3.select(heatmapContainer.value!)
        .append("svg")
        .classed(className, true)
        .attr("version", "1.1")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("viewBox", `0 0 ${containerWidth.value} ${containerHeight.value}`)
        .attr("width", `${containerWidth.value}px`)
        .attr("height", `${containerHeight.value}px`)
        .attr("overflow", "hidden")
        .attr("font-family", labelFontFamily);

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

    if (colNames.length > 0) {
        renderColumnLabels(svg);
    }

    if (rowNames.length > 0) {
        renderRowLabels(svg);
        renderGrid(svg);
    }
};

const renderColumnLabels = (svgElement: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    const headerContainer = svgElement.append("g")
        .attr("transform", `translate(${rowLabelWidth.value + labelSpacing}, 0)`);

    headerContainer
        .append("g")
        .selectAll("text")
        .data(colNames)
        .join("text")
        .attr("font-size", labelFontSize)
        .attr("font-weight", labelFontWeight)
        .attr("fill", labelColor)
        .classed("header-label", true)
        .attr("data-col-label", (d, i) => i)
        .text(d => ellipsizeString(d, labelFontSize, labelFontFamily, labelFontWeight, (colLabelHeight.value / Math.cos((1 / 4) * Math.PI)) - 2 * labelSpacing))
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "hanging")
        .attr("x", (d, i) => i * (cellSize + cellSpacing) + cellSize / 2)
        .attr("y", colLabelHeight.value - labelSpacing)
        .attr("dy", ".35em")
        .attr("transform", (d, i) => `translate(0, -${labelSpacing}) rotate(45, ${i * (cellSize + cellSpacing) + cellSize / 2}, ${colLabelHeight.value - labelSpacing})`);
};

const renderRowLabels = (svgElement: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    const rowLabelContainer = svgElement.append("g");

    rowLabelContainer
        .selectAll("text")
        .data(rowNames)
        .join("text")
        .attr("font-size", labelFontSize)
        .attr("font-weight", 500)
        .attr("fill", labelColor)
        .text(d => ellipsizeString(d, labelFontSize, labelFontFamily, labelFontWeight, rowLabelWidth.value - 2 * labelSpacing))
        .attr("text-anchor", "end")
        .attr("x", rowLabelWidth.value - labelSpacing)
        .attr("y", (d, i) => i * (cellSize + cellSpacing) + colLabelHeight.value + cellSize / 2)
        .attr("dy", ".35em")
        .attr("data-row-label", (d, i) => i)
        .classed("row-label", true);
}

const renderGrid = (svgElement: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    const visualizationContainer = svgElement
        .append("g")
        .attr("transform", `translate(${rowLabelWidth.value}, ${colLabelHeight.value})`);

    // Render the samples as columns for the heatmap
    const rows = visualizationContainer
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * (cellSize + cellSpacing)})`)
        .attr("data-row-item", (d, i) => i);

    rows.selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", (d, i) => i * (cellSize + cellSpacing))
        .attr("y", 0)
        .attr("rx", 4)
        .attr("fill", (d) => colorInterpolator(d.value))
        .attr("data-col-item", (d, i) => i)
        .classed("cell", true);

    if (showCellLabels) {
        rows.selectAll("text")
            .data(d => d)
            .enter()
            .append("text")
            .attr("font-size", cellFontSize)
            .attr("fill", labelColor)
            .text(d => d.label || "")
            .attr("x", (d, i) => i * (cellSize + cellSpacing) + cellSize / 2)
            .attr("y", cellSize / 2)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("data-col-item", (d, i) => i)
            .classed("cell", true)
    }

    // Then add invisible, slightly larger rectangles on top for the mouse events
    rows.selectAll(".cell-overlay")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("width", cellSize + cellSpacing)
        .attr("height", cellSize + cellSpacing)
        .attr("x", (d, i) => i * (cellSize + cellSpacing / 2)) // Center the overlay
        .attr("y", -(cellSpacing / 2)) // Center the overlay
        .attr("fill", "transparent") // Make it invisible
        .attr("pointer-events", "all") // Ensure it captures mouse events
        .attr("data-col-item", (d, i) => i)
        .on("mouseover", (event: MouseEvent, d: any) => {
            // Find the corresponding visible cell
            const overlay = event.target as HTMLElement;
            const colIdx = parseInt(overlay.getAttribute("data-col-item")!);
            const rowIdx = parseInt(overlay.parentElement!.getAttribute("data-row-item")!);

            highlightCell(overlay, rowIdx, colIdx);
            showTooltip(event, rowIdx, colIdx);
        })
        .on("mousemove", (event: MouseEvent, d: any) => {
            moveTooltip(event);
        })
        .on("mouseleave", (event: MouseEvent, d: any) => {
            // Find the corresponding visible cell
            const overlay = event.target as HTMLElement;
            const colIdx = parseInt(overlay.getAttribute("data-col-item")!);
            const rowIdx = parseInt(overlay.parentElement!.getAttribute("data-row-item")!);

            stopHighlightingCell(overlay, rowIdx, colIdx);
            hideTooltip();
        })
        .on("click", (event: MouseEvent, d: any) => {
            // Find the corresponding visible cell
            const overlay = event.target as HTMLElement;
            const colIdx = parseInt(overlay.getAttribute("data-col-item")!);
            const rowIdx = parseInt(overlay.parentElement!.getAttribute("data-row-item")!);
            const cell = overlay.parentElement!.querySelector(`.cell[data-col-item="${colIdx}"]`) as HTMLElement;

            // Toggle the cell selection if it has already been selected by the user
            if (selectedCell.value.rowIdx === rowIdx && selectedCell.value.colIdx === colIdx) {
                stopSelectedCell();
            } else {
                selectCell(cell, rowIdx, colIdx);
            }
        });
    
    if (selectedCell.value.rowIdx !== -1 && selectedCell.value.colIdx !== -1) {
        // Find the row element with the data attribute for the selected row
        const row = document.querySelector(`g[data-row-item="${selectedCell.value.rowIdx}"]`);
        // Find the cell within that row that has the matching column data attribute
        const cell = row?.querySelector(`rect[data-col-item="${selectedCell.value.colIdx}"]`) as HTMLElement;

        if (cell) {
            selectCell(cell, selectedCell.value.rowIdx, selectedCell.value.colIdx);
        }
    }
};

const debouncedRender = useDebounceFn(renderHeatmap, 20);

onMounted(() => {
    debouncedRender();
});

watch(() => rowNames, () => {
    debouncedRender();
}, { deep: true });

watch(() => colNames, () => {
    debouncedRender();
}, { deep: true });

watch(() => [ data, showCellLabels ], () => {
    debouncedRender();
}, { deep: true });

watch(() => highlightedCell, () => {
    console.log(JSON.stringify(highlightedCell.value));
});
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

.unipept-heatmap .selected-cell {
    stroke-width: 2px;
    stroke: v-bind(selectedStrokeColor);
}

.unipept-heatmap .selected-label {
    text-decoration: underline;
}
</style>


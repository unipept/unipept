<template>
    <svg width="100%" height="100%" version="1.1" overflow="visible" style="position: absolute; top: 0; left: 0; pointer-events: none;">
        <g
            v-for="(area, i) in coloredRectangles"
            :key="`rect-${i}`"
            :transform="`scale(${scale})`"
            style="pointer-events: all; cursor: pointer;"
            @mouseenter="onMouseEnter(i, area)"
            @mouseleave="onMouseLeave"
        >
            <!-- Split rectangle into bands, one per matching analysis -->
            <rect
                v-for="(band, j) in splitRect(area)"
                :key="j"
                :x="band.x1"
                :y="band.y1"
                :width="band.x2 - band.x1"
                :height="band.y2 - band.y1"
                :fill="band.color"
                fill-opacity="0.5"
            />
        </g>

        <!-- Tooltip -->
        <g
            v-if="hoveredIndex !== null && tooltipData"
            :transform="`scale(${scale})`"
        >
            <rect
                :x="tooltipData.boundingX"
                :y="tooltipData.boundingY"
                :width="tooltipData.boundingWidth"
                :height="tooltipData.boundingHeight"
                fill="black"
                stroke="black"
                opacity="0.75"
                rx="8"
            />
            <text
                :x="tooltipData.textX"
                :y="tooltipData.textY"
                font-size="14"
                font-family="monospace"
                dominant-baseline="hanging"
                fill="white"
            >
                <tspan
                    v-for="(line, j) in tooltipData.lines"
                    :key="j"
                    :x="tooltipData.textX"
                    :dy="j === 0 ? 0 : 18"
                >{{ line }}</tspan>
            </text>
        </g>
    </svg>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { SingleAnalysisStore } from '@/store/SingleAnalysisStore';
import { EcInfo } from '@/logic/communicators/PathwayPilotCommunicator';

const props = defineProps<{
    areas: any[];
    scale: number;
    ecMapping: Map<string, EcInfo> | undefined;
    analyses: SingleAnalysisStore[];
    analysisColors: string[];
}>();

const hoveredIndex = ref<number | null>(null);
const hoveredArea = ref<any>(null);

const hasMatchingEc = (area: any, ecSet: Set<string>): boolean => {
    if (!area?.info?.ecNumbers) return false;
    return area.info.ecNumbers.some((ec: any) => ecSet.has(ec.id ?? ec));
};

const isSelectable = (area: any) => {
    if (!area?.info) return false;
    return (area.info.ecNumbers?.length ?? 0)
         + (area.info.koNumbers?.length ?? 0)
         + (area.info.compounds?.length ?? 0)
         + (area.info.reactions?.length ?? 0) > 0;
};

const coloredRectangles = computed(() => {
    return props.areas
        .filter(a => a.shape === 'rect' && isSelectable(a))
        .map(area => {
            const matchingColors = props.analyses
                .map((analysis, i) => ({
                    color: props.analysisColors[i],
                    matches: hasMatchingEc(area, analysis.pathwayPilotStore.ecs)
                }))
                .filter(c => c.matches)
                .map(c => c.color);

            return { ...area, colors: matchingColors };
        })
        .filter(a => a.colors.length > 0);
});

const splitRect = (area: { x1: number; y1: number; x2: number; y2: number; colors: string[] }) => {
    const parts = area.colors.length;
    if (parts === 0) return [];

    const width = area.x2 - area.x1;
    const bandWidth = width / parts;

    return area.colors.map((color, i) => ({
        x1: area.x1 + bandWidth * i,
        y1: area.y1,
        x2: area.x1 + bandWidth * (i + 1),
        y2: area.y2,
        color
    }));
};

const tooltipData = computed(() => {
    if (hoveredIndex.value === null || !hoveredArea.value) return null;

    const area = hoveredArea.value;
    const ecNumbers: any[] = area.info?.ecNumbers ?? [];

    const lines = ecNumbers.map((ec: any) => {
        const id = ec.id ?? ec;
        const name = props.ecMapping?.get(id)?.names?.[0] ?? 'Unknown';
        return `${id}: ${name}`;
    });

    if (lines.length === 0) return null;

    const padding = { x: 10, y: 8 };
    const lineHeight = 18;
    const charWidth = 8;
    const maxChars = lines.reduce((max, l) => Math.max(max, l.length), 0);
    const boundingWidth = 2 * padding.x + charWidth * maxChars;
    const boundingHeight = 2 * padding.y + lineHeight * lines.length;
    const boundingX = area.x1 + (area.x2 - area.x1) / 2 - boundingWidth / 2;
    const boundingY = area.y1 - boundingHeight - 10;

    return {
        boundingX,
        boundingY,
        boundingWidth,
        boundingHeight,
        textX: boundingX + padding.x,
        textY: boundingY + padding.y,
        lines
    };
});

const onMouseEnter = (index: number, area: any) => {
    hoveredIndex.value = index;
    hoveredArea.value = area;
};

const onMouseLeave = () => {
    hoveredIndex.value = null;
    hoveredArea.value = null;
};
</script>

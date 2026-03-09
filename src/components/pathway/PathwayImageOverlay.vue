<template>
    <svg
        width="100%"
        height="100%"
        version="1.1"
        overflow="visible"
        style="position: absolute; top: 0; left: 0;"
    >
        <!-- All selectable rects (matched get color bands, unmatched stay transparent but hoverable) -->
        <g
            v-for="(area, i) in selectableRects"
            :key="`rect-${i}`"
            :transform="`scale(${scale})`"
            style="pointer-events: all;"
            cursor="pointer"
            @mousedown.stop
            @click="onClickArea(area, 'r' + i)"
            @mouseenter="rectHover = i"
            @mouseleave="rectHover = undefined"
        >
            <!-- Color bands (only for matched areas) -->
            <rect
                v-for="(r, j) in splitRectangle(area)"
                :key="j"
                :x="r.x1"
                :y="r.y1"
                :width="r.x2 - r.x1"
                :height="r.y2 - r.y1"
                :fill="r.color"
                fill-opacity="0.5"
            />
            <!-- Transparent overlay for hover cursor + selection outline -->
            <!-- White halo (outer ring) rendered first so the blue ring paints on top -->
            <rect
                v-if="selectedAreaKey === 'r' + i"
                :x="area.x1"
                :y="area.y1"
                :width="area.x2 - area.x1"
                :height="area.y2 - area.y1"
                fill="rgba(76, 140, 191, 0.12)"
                stroke="white"
                stroke-width="7"
            />
            <rect
                :x="area.x1"
                :y="area.y1"
                :width="area.x2 - area.x1"
                :height="area.y2 - area.y1"
                fill="transparent"
                :stroke="selectedAreaKey === 'r' + i ? '#4c8cbf' : 'none'"
                :stroke-width="selectedAreaKey === 'r' + i ? 4 : 0"
            />
        </g>

        <!-- Empty polygons (structural outlines, gray if many) -->
        <g
            v-for="(area, i) in emptyPolygons"
            :key="`epoly-${i}`"
            :transform="`scale(${scale})`"
            style="pointer-events: all;"
            cursor="pointer"
            @mousedown.stop
            @click="onClickArea(area, 'ep' + i)"
        >
            <polygon
                v-if="selectedAreaKey === 'ep' + i"
                :points="area.points"
                fill="rgba(76, 140, 191, 0.12)"
                stroke="white"
                stroke-width="7"
            />
            <polygon
                :points="area.points"
                :fill="polygons.length > 20 ? '#e3e3e3' : 'transparent'"
                :stroke="selectedAreaKey === 'ep' + i ? '#4c8cbf' : 'none'"
                :stroke-width="selectedAreaKey === 'ep' + i ? 4 : 0"
            />
        </g>

        <!-- Colored polygons (with linear gradient for multi-color) -->
        <g
            v-for="(area, i) in coloredPolygons"
            :key="`cpoly-${i}`"
            :transform="`scale(${scale})`"
            style="pointer-events: all;"
            cursor="pointer"
            @mousedown.stop
            @click="onClickArea(area, 'cp' + i)"
        >
            <defs>
                <linearGradient
                    v-if="area.colors.length > 1"
                    :id="`pg-${i}`"
                    x1="0%" y1="0%" x2="100%" y2="0%"
                >
                    <template v-for="(color, ci) in area.colors" :key="ci">
                        <stop
                            :offset="`${Number(ci) * 100 / area.colors.length}%`"
                            :stop-color="color"
                            stop-opacity="1"
                        />
                        <stop
                            :offset="`${(Number(ci) + 1) * 100 / area.colors.length}%`"
                            :stop-color="color"
                            stop-opacity="1"
                        />
                    </template>
                </linearGradient>
            </defs>
            <polygon
                v-if="selectedAreaKey === 'cp' + i"
                :points="area.points"
                fill="rgba(76, 140, 191, 0.12)"
                stroke="white"
                stroke-width="7"
            />
            <polygon
                :points="area.points"
                :fill="area.colors.length === 1 ? area.colors[0] : `url(#pg-${i})`"
                fill-opacity="0.5"
                :stroke="selectedAreaKey === 'cp' + i ? '#4c8cbf' : 'none'"
                :stroke-width="selectedAreaKey === 'cp' + i ? 4 : 0"
            />
        </g>

        <!-- Circles (compounds): transparent fill, outline when selected -->
        <g
            v-for="(area, i) in circles"
            :key="`circle-${i}`"
            :transform="`scale(${scale})`"
            style="pointer-events: all;"
            cursor="pointer"
            @mousedown.stop
            @click="onClickCompound(area, i)"
            @mouseenter="circleHover = i"
            @mouseleave="circleHover = undefined"
        >
            <circle
                v-if="selectedCircleIdx === i"
                :cx="area.x + 1"
                :cy="area.y + 1"
                :r="area.r"
                fill="rgba(76, 140, 191, 0.12)"
                stroke="white"
                stroke-width="7"
            />
            <circle
                :cx="area.x + 1"
                :cy="area.y + 1"
                :r="area.r"
                fill="transparent"
                :stroke="selectedCircleIdx === i ? '#4c8cbf' : 'none'"
                :stroke-width="selectedCircleIdx === i ? 4 : 0"
            />
        </g>

        <!-- White border overlay to cover the image border edge -->
        <rect class="border" width="100%" height="100%" fill="none" />

        <!-- Tooltips for hovered selectable rect areas -->
        <g
            v-for="(tt, i) in rectTooltips"
            :key="`tt-${i}`"
            :transform="`scale(${scale})`"
        >
            <template v-if="rectHover === i && tt.text.length > 0">
                <rect
                    :x="tt.boundingX"
                    :y="tt.boundingY"
                    :width="tt.boundingWidth"
                    :height="tt.boundingHeight"
                    fill="black"
                    stroke="black"
                    opacity="0.7"
                    rx="15"
                />
                <text
                    :x="tt.textX"
                    :y="tt.textY"
                    font-size="26"
                    font-family="monospace"
                    dominant-baseline="hanging"
                    fill="white"
                >
                    <tspan
                        v-for="(t, j) in tt.text"
                        :key="j"
                        :x="tt.textX"
                        :dy="j === 0 ? 0 : tt.textOffset"
                    >{{ t }}</tspan>
                </text>
            </template>
        </g>

        <!-- Tooltips for hovered circles (compounds) -->
        <g
            v-for="(ct, i) in circleTooltips"
            :key="`ct-${i}`"
            :transform="`scale(${scale})`"
        >
            <template v-if="circleHover === i && ct.text.length > 0">
                <rect
                    :x="ct.boundingX"
                    :y="ct.boundingY"
                    :width="ct.boundingWidth"
                    :height="ct.boundingHeight"
                    fill="black"
                    stroke="black"
                    opacity="0.7"
                    rx="15"
                />
                <text
                    :x="ct.textX"
                    :y="ct.textY"
                    font-size="26"
                    font-family="monospace"
                    dominant-baseline="hanging"
                    fill="white"
                >
                    <tspan
                        v-for="(t, j) in ct.text"
                        :key="j"
                        :x="ct.textX"
                        :dy="j === 0 ? 0 : ct.textOffset"
                    >{{ t }}</tspan>
                </text>
            </template>
        </g>
    </svg>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { EcInfo, CompoundInfo } from '@/logic/communicators/PathwayPilotCommunicator';
import { isSelectable } from '@/composables/pathway/usePathwayColors';

const props = defineProps<{
    areas: any[];
    scale: number;
    ecMapping: Map<string, EcInfo> | undefined;
    compoundMapping?: Map<string, CompoundInfo> | undefined;
}>();

const emit = defineEmits<{
    'click:area': [area: any];
    'click:compound': [compound: any];
}>();

// Track selected area/compound by a stable key (type+index) to avoid object identity issues
const selectedAreaKey = ref<string | undefined>(undefined);
const selectedCircleIdx = ref<number | undefined>(undefined);

// Still keep object refs for emitting to parent
const selectedArea = ref<any>(undefined);
const selectedCompound = ref<any>(undefined);

const rectHover = ref<number | undefined>(undefined);
const circleHover = ref<number | undefined>(undefined);

// All selectable rects — matched (with colors) and unmatched (transparent) both rendered
const selectableRects = computed(() =>
    props.areas.filter(a => a.shape === 'rect' && isSelectable(a))
);

const circles = computed(() => props.areas.filter(a => a.shape === 'circle'));
const polygons = computed(() => props.areas.filter(a => a.shape === 'poly'));
const coloredPolygons = computed(() => polygons.value.filter(a => (a.colors?.length ?? 0) > 0));
const emptyPolygons = computed(() => polygons.value.filter(a => !(a.colors?.length ?? 0)));

const splitRectangle = (area: any): { x1: number; y1: number; x2: number; y2: number; color: string }[] => {
    const colors: string[] = area.colors ?? [];
    if (colors.length === 0) return [];
    const width = area.x2 - area.x1;
    const bandWidth = width / colors.length;
    return colors.map((color, i) => ({
        x1: area.x1 + bandWidth * i,
        y1: area.y1,
        x2: area.x1 + bandWidth * (i + 1),
        y2: area.y2,
        color
    }));
};

const computeRectTooltip = (area: any) => {
    const px = 30, py = 20;
    const lineHeight = 22, lineDistance = 10;
    const charWidth = 15.8;
    const tooltipOffset = 25;

    const ecNumbers = area.info?.ecNumbers ?? [];
    const text: string[] = ecNumbers.map((ec: any) =>
        `${ec.id}: ${props.ecMapping?.get(ec.id)?.names?.[0] ?? 'Unknown'}`
    );

    if (text.length === 0) {
        return { text: [], boundingX: 0, boundingY: 0, boundingWidth: 0, boundingHeight: 0, textX: 0, textY: 0, textOffset: 0 };
    }

    const amountOfCharacters = text.reduce((a, b) => Math.max(a, b.length), 0);
    const boundingWidth = 2 * px + charWidth * amountOfCharacters;
    const boundingHeight = 2 * py + lineHeight * text.length + lineDistance * (text.length - 1);
    const boundingX = area.x1 + (area.x2 - area.x1) / 2 - boundingWidth / 2;
    const boundingY = area.y1 - boundingHeight - tooltipOffset;

    return {
        text,
        boundingX, boundingY, boundingWidth, boundingHeight,
        textX: boundingX + px,
        textY: boundingY + py,
        textOffset: lineHeight + lineDistance
    };
};

const computeCircleTooltip = (area: any) => {
    const px = 30, py = 20;
    const lineHeight = 22, lineDistance = 10;
    const charWidth = 15.8;
    const tooltipOffset = 25;

    const compoundId = area.info?.compounds?.[0]?.id ?? area.id;
    if (!compoundId) return { text: [], boundingX: 0, boundingY: 0, boundingWidth: 0, boundingHeight: 0, textX: 0, textY: 0, textOffset: 0 };

    const name = props.compoundMapping?.get(compoundId)?.names?.[0] ?? 'Unknown';
    const text = [`${compoundId}: ${name}`];

    const amountOfCharacters = text.reduce((a, b) => Math.max(a, b.length), 0);
    const boundingWidth = 2 * px + charWidth * amountOfCharacters;
    const boundingHeight = 2 * py + lineHeight;
    const cx = area.x + 1;
    const cy = area.y + 1 - (area.r ?? 10);
    const boundingX = cx - boundingWidth / 2;
    const boundingY = cy - boundingHeight - tooltipOffset;

    return {
        text,
        boundingX, boundingY, boundingWidth, boundingHeight,
        textX: boundingX + px,
        textY: boundingY + py,
        textOffset: lineHeight + lineDistance
    };
};

const rectTooltips = computed(() => selectableRects.value.map(computeRectTooltip));
const circleTooltips = computed(() => circles.value.map(computeCircleTooltip));

const onClickArea = (area: any, key: string) => {
    selectedCircleIdx.value = undefined;
    selectedCompound.value = undefined;
    const isSame = selectedAreaKey.value === key;
    selectedAreaKey.value = isSame ? undefined : key;
    selectedArea.value = isSame ? undefined : area;
    emit('click:area', selectedArea.value);
};

const onClickCompound = (compound: any, idx: number) => {
    selectedAreaKey.value = undefined;
    selectedArea.value = undefined;
    const isSame = selectedCircleIdx.value === idx;
    selectedCircleIdx.value = isSame ? undefined : idx;
    selectedCompound.value = isSame ? undefined : compound;
    emit('click:compound', selectedCompound.value);
};
</script>

<style scoped>
.border {
    outline-color: white;
    outline-style: solid;
    outline-width: 10px;
    outline-offset: -5px;
}
</style>

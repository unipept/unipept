<template>
    <svg
        width="100%"
        height="100%"
        overflow="visible"
        style="position: absolute; top: 0; left: 0;"
    >
        <!-- White border overlay to cover the image border edge -->
        <rect class="border" width="100%" height="100%" fill="none" />

        <!-- All selectable rectangles -->
        <!-- All rectangles with a match get split into color bands based on the number of groups that match there -->
        <!-- Other rectangles stay transparent so they can remain hoverable -->
        <g
            v-for="(area, i) in selectableRects"
            :key="`rect${i}`"
            :transform="`scale(${scale})`"
            class="cursor-events"
            @mousedown.stop
            @click="onClickArea(area, `rect${i}`)"
            @mouseenter="hoveredKey = `rect${i}`"
            @mouseleave="hoveredKey = undefined"
        >
            <!-- Draw all the color bands for rectangles with a match -->
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

            <!-- Transparent overlay to make all rectangles interactable  -->
            <!-- Stroke only when selected, otherwise no stroke to allow hover on adjacent areas -->
            <rect
                :x="area.x1 - 1"
                :y="area.y1 - 1"
                :width="area.x2 - area.x1"
                :height="area.y2 - area.y1"
                fill="transparent"
                :stroke="selectedKey === `rect${i}` ? 'black' : 'none'"
                :stroke-width="selectedKey === `rect${i}` ? 6 : 0"
            />
        </g>

        <!-- All selectable circles -->
        <g
            v-for="(area, i) in selectableCircles"
            :key="`circle${i}`"
            :transform="`scale(${scale})`"
            class="cursor-events"
            @mousedown.stop
            @click="onClickCompound(area, `circle${i}`)"
            @mouseenter="hoveredKey = `circle${i}`"
            @mouseleave="hoveredKey = undefined"
        >
            <!-- Circles: transparent fill, outline when selected -->
            <circle
                :cx="area.x - 1"
                :cy="area.y - 1"
                :r="area.r"
                fill="transparent"
                :stroke="selectedKey === `circle${i}` ? 'black' : 'none'"
                :stroke-width="selectedKey === `circle${i}` ? 6 : 0"
            />
        </g>

        <!-- Tooltips for hovered selectable rect and circle areas -->
        <g
            v-for="(tt, i) in [...rectTooltips, ...circleTooltips]"
            :key="`tt${i}`"
            :transform="`scale(${scale})`"
        >
            <template v-if="tt.text.length > 0 && (hoveredKey === `rect${i}` || hoveredKey === `circle${i - rectTooltips.length}`)">
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
    </svg>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { isSelectable } from '@/composables/pathway/usePathwayColors';
import { useCalculateAreaTooltip } from './useCalculateAreaTooltip';

const props = defineProps<{
    areas: any[];
    scale: number;
}>();

const emit = defineEmits<{
    'click:area': [area: any];
    'click:compound': [compound: any];
}>();

const selectedKey = ref<string | undefined>(undefined);
const selectedArea = ref<any>(undefined);
const hoveredKey = ref<string | undefined>(undefined);

const selectableRects = computed(() => props.areas.filter(a => a.shape === 'rect' && isSelectable(a)));
const selectableCircles = computed(() => props.areas.filter(a => a.shape === 'circle'));

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

const { rectTooltips, circleTooltips } = useCalculateAreaTooltip(selectableRects, selectableCircles);

const onClick = (area: any, key: string) => {
    const isSame = selectedKey.value === key;
    selectedKey.value = isSame ? undefined : key;
    selectedArea.value = isSame ? undefined : area;
};

const onClickArea = (area: any, key: string) => {
    onClick(area, key);
    emit('click:area', selectedArea.value);
};

const onClickCompound = (compound: any, key: string) => {
    onClick(compound, key);
    emit('click:compound', selectedArea.value);
};
</script>

<style scoped>
.border {
    outline: white solid 10px;
    outline-offset: -5px;
}

.cursor-events {
    pointer-events: all;
    cursor: pointer;
}
</style>

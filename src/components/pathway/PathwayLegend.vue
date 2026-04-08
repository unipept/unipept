<template>
    <div v-if="items.length > 0" class="legend-overlay">
        <template v-if="showDifferential && differentialLabels && differentialColors">
            <div class="d-flex flex-column align-center ga-1">
                <span class="text-caption font-weight-medium" :style="{ color: differentialColors[0] }">{{ differentialLabels[0] }}</span>
                <div
                    class="differential-gradient"
                    :style="{ background: `linear-gradient(to bottom, ${differentialColors[0]}, #ffffe0, ${differentialColors[1]})` }"
                ></div>
                <span class="text-caption font-weight-medium" :style="{ color: differentialColors[1] }">{{ differentialLabels[1] }}</span>
            </div>
        </template>
        <template v-else>
            <div class="d-flex flex-column ga-1">
                <div v-for="item in items" :key="item.label" class="d-flex align-center ga-2">
                    <div class="legend-swatch" :style="{ background: item.color }"></div>
                    <span class="text-caption">{{ item.label }}</span>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    items:               { label: string; color: string }[];
    showDifferential:    boolean;
    differentialLabels?: [string, string];
    differentialColors?: [string, string];
}>()
</script>

<style scoped>
.legend-overlay {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 6px;
    padding: 8px 10px;
    pointer-events: none;
}

.legend-swatch {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    flex-shrink: 0;
    opacity: 0.8;
}

.differential-gradient {
    width: 14px;
    height: 80px;
    border-radius: 3px;
}
</style>

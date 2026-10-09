<template>
    <div
        v-if="loading"
        style="padding: 8px 12px;"
    >
        <div class="score-placeholder" />
    </div>
    <div
        v-else-if="score !== undefined"
        :class="{ 'text-disabled': outdated }"
        :style="{
            padding: '8px 12px',
            background: `linear-gradient(90deg, ${barColor} 0%, ${barColor} ${score * 100}%, rgb(240, 240, 240) ${score * 100}%, rgb(240, 240, 240) 100%)`,
        }"
    >
        {{ score.toFixed(2) }}
    </div>
    <v-tooltip
        v-else
        text="Not scored by NORI"
    >
        <template #activator="{ props }">
            <span
                v-bind="props"
                class="text-disabled"
                style="padding: 8px 12px;"
            >
                &mdash;
            </span>
        </template>
    </v-tooltip>
</template>

<script setup lang="ts">
import {computed} from "vue";

const { outdated = false } = defineProps<{
    score?: number;
    loading: boolean;
    // Outdated scores are shown in grey, because they were computed for a different taxonomic filter
    outdated?: boolean;
}>();

const barColor = computed(() => outdated ? "rgba(var(--v-theme-on-surface), 0.12)" : "rgba(var(--v-theme-primary), 0.35)");
</script>

<style scoped>
.score-placeholder {
    width: 48px;
    height: 8px;
    border-radius: 4px;
    background: rgba(var(--v-theme-on-surface), 0.08);
}
</style>

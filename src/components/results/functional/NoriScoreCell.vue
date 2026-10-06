<template>
    <div
        v-if="loading"
        style="padding: 8px 12px;"
    >
        <div class="score-placeholder" />
    </div>
    <div
        v-else-if="score !== undefined"
        :style="{
            padding: '8px 12px',
            background: `linear-gradient(90deg, rgba(25, 118, 210, 0.35) 0%, rgba(25, 118, 210, 0.35) ${score * 100}%, rgb(240, 240, 240) ${score * 100}%, rgb(240, 240, 240) 100%)`,
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
defineProps<{
    score?: number;
    loading: boolean;
}>();
</script>

<style scoped>
.score-placeholder {
    width: 48px;
    height: 8px;
    border-radius: 4px;
    background: rgba(var(--v-theme-on-surface), 0.08);
}
</style>

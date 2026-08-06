<template>
    <div
        v-if="probability !== undefined"
        :style="{
            padding: '8px 12px',
            background: `linear-gradient(90deg, rgb(221, 221, 221) 0%, rgb(221, 221, 221) ${probability * 100}%, rgb(240, 240, 240) ${probability * 100}%, rgb(240, 240, 240) 100%)`,
        }"
    >
        {{ displayPercentage(probability) }}
    </div>
    <div v-else>
        —
    </div>
</template>

<script setup lang="ts">
import usePercentage from "@/composables/usePercentage";

defineProps<{
    // Undefined while the presence-probability computation for this term is pending/running/failed.
    probability?: number;
}>();

const { displayPercentage } = usePercentage();
</script>

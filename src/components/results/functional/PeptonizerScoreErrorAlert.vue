<template>
    <v-alert
        variant="tonal"
        type="error"
        density="compact"
        class="mb-4"
    >
        <div class="d-flex align-center justify-space-between">
            <div>
                <div>The Peptonizer scores could not be computed. All annotations are shown without a score.</div>
                <div class="text-caption">Error: {{ error }}</div>
            </div>
            <v-btn
                variant="outlined"
                size="small"
                prepend-icon="mdi-restart"
                text="Retry"
                class="ml-4"
                @click="emit('retry')"
            />
        </div>
    </v-alert>
</template>

<script setup lang="ts">
defineProps<{
    error: string;
}>();

const emit = defineEmits<{
    retry: [];
}>();
</script>

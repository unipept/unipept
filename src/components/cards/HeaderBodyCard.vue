<template>
    <v-unipept-card class="pa-0">
        <v-card-title
            class="pa-4 bg-primary text-white"
            :class="{ 'large-title': largeTitle }"
        >
            {{ title }}
        </v-card-title>

        <v-card-text>
            <slot />
        </v-card-text>

        <slot name="extension" />
    </v-unipept-card>
</template>

<script setup lang="ts">
export interface Props {
    title: string,
    largeTitle?: boolean
}

withDefaults(defineProps<Props>(), {
    largeTitle: false
});
</script>

<style scoped>
.large-title {
    font-size: 1.25rem;
}
</style>

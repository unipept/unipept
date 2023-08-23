<template>
    <v-card>
        <v-card-title class="pa-4 bg-primary text-white">
            {{ title }}
        </v-card-title>

        <v-card-text>
            <slot />
        </v-card-text>

        <slot name="extension" />
    </v-card>
</template>

<script setup lang="ts">
export interface Props {
    title: string
}

/* eslint-disable */
defineProps<Props>()
</script>

<style scoped>
</style>

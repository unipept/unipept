<template>
    <v-card>
        <v-card-title class="blue white--text">{{ title }}</v-card-title>

        <v-card-text class="mt-4">
            <slot></slot>
        </v-card-text>

        <slot name="extension"></slot>
    </v-card>
</template>

<script setup lang="ts">
export interface Props {
    title: String
}

/* eslint-disable */
defineProps<Props>()
</script>

<style scoped>
</style>

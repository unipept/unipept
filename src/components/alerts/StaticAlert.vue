<template>
    <v-alert
        class="pb-2"
        border="left"
        colored-border
        color="secondary"
        elevation="1"
    >
        <h2 class="secondary--text font-weight-light mb-1">{{ title }}</h2>
        <slot></slot>
    </v-alert>
</template>

<script setup lang="ts">
export interface Props {
    title: String
}

/* eslint-disable */
defineProps<Props>()
</script>

<style scoped>
.v-alert {
    font-size: inherit;
    padding-left: 32px;
    padding-bottom: 0;
}
</style>

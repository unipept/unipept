<template>
    <v-tabs
        slider-size="3"
        color="secondary"
        height="35px"
    >
        <v-tab
            v-for="item in items"
            :key="item.name"
            :to="item.link"
            exact-path
        >
            {{ item.name }}
        </v-tab>
    </v-tabs>
</template>

<script setup lang="ts">
import { NavigationItem } from './NavigationItem';

export interface Props {
    items: NavigationItem[]
}

defineProps<Props>()
</script>

<style>
.v-tab {
    text-transform: none;
}
</style>

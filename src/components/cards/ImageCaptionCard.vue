<template>
    <v-card class="px-5 pt-5">
        <v-img
            :src="image"
            :alt="image"
        />

        <v-card-text class="mt-4 px-0 pt-0">
            <slot />
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
export interface Props {
    image: string
}

defineProps<Props>();
</script>

<template>
    <v-unipept-card
        :elevation="hover ? 6 : 2"
        class="equal pa-0"
    >
        <v-img
            height="300"
            :src="asset"
            :alt="asset"
            :cover="!contain"
        />

        <v-card-title class="feature-title pa-4">
            {{ title }}
        </v-card-title>

        <v-card-text class="mt-4">
            <slot />
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
export interface Props {
    title: string,
    asset: string,
    hover: boolean,
    contain?: boolean
}

withDefaults(defineProps<Props>(), {
    contain: false,
})
</script>

<style scoped>
a {
    text-decoration: none;
}

.feature-title {
    opacity: 0.70;
    background-color: black;
    color: white;
    margin-top: -64px;
}

.equal {
    height: 100%;
}
</style>

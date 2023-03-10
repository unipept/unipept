<template>
    <v-card :elevation="hover ? 6 : 2" class="equal">
        <v-img
            height="300"
            :src="asset"
            :alt="asset"
            :contain="contain"
        />

        <v-card-title class="feature-title">{{ title }}</v-card-title>

        <v-card-text class="mt-4">
            <slot></slot>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "HomePageCard",
    setup() { },
    props: {
        title: String,
        asset: String,
        hover: Boolean,
        contain: Boolean
    }
});
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

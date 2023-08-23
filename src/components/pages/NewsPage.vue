<template>
    <v-container>
        <v-row>
            <v-col
                class="pt-0"
                sm="12"
                lg="10"
                order-sm="1"
                order-lg="0"
            >
                <router-view />
            </v-col>
            <v-col
                sm="12"
                lg="2"
                order-sm="0"
                order-lg="1"
            >
                <vertical-navigation
                    v-if="display.lgAndUp"
                    :items="navigation"
                />
                <horizontal-navigation
                    v-else
                    :items="navigation"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import VerticalNavigation from "@/components/navigation/VerticalNavigation.vue";
import HorizontalNavigation from "@/components/navigation/HorizontalNavigation.vue";
import { useDisplay } from "vuetify";
import { ref } from "vue";

const display = ref(useDisplay());

const navigation = [
    { name: "Overview", link: "/news" },
    { name: "API", link: "/news/api" },
    { name: "CLI", link: "/news/cli" },
    { name: "Web", link: "/news/web" },
    { name: "Desktop", link: "/news/desktop" },
];
</script>

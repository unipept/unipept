<template>
    <v-container style="max-width: 1200px;">
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
import { ref } from "vue";
import { useDisplay } from "vuetify";
import VerticalNavigation from "@/components/navigation/VerticalNavigation.vue";
import HorizontalNavigation from "@/components/navigation/HorizontalNavigation.vue";

const display = ref(useDisplay());

const navigation = [
    {
        name: "Getting started",
        link: "/desktop",
        children: [
            { name: "Download", link: "#download" },
            { name: "Install for Windows", link: "#windows_installation" },
            { name: "Install for macOS", link: "#macos_installation" },
            { name: "Install for Linux", link: "#linux_installation" },
            { name: "First time use", link: "#first_time_use" },
            { name: "Updating the application", link: "#update" }
        ]
    },
    {
        name: "Application overview",
        link: "/desktop/application-overview",
        children: [
            { name: "Application window", link: "#application_window" },
            { name: "Sidebar", link: "#sidebar" }
        ]
    },
    {
        name: "Project management",
        link: "/desktop/project-management",
        children: [
            { name: "Overview", link: "#overview" },
            { name: "Managing projects", link: "#managing_projects" }
        ]
    },
    {
        name: "Single assay analysis",
        link: "/desktop/single-assay-analysis",
        children: [
            { name: "Overview", link: "#overview" },
            { name: "Analyse an assay", link: "#analysing_assay" },
            { name: "Browse analysis results", link: "#taxonomic_analysis_results" }
        ]
    },
    {
        name: "Comparative analysis",
        link: "/desktop/comparative-analysis",
        children: [
            { name: "Overview", link: "#overview" },
            { name: "Intra-assay comparison", link: "#intra_assay_comparison" },
            { name: "Inter-assay comparison", link: "#inter_assay_comparison" }
        ]
    },
    {
        name: "Configuration options",
        link: "/desktop/configuration",
        children: [
            { name: "Concurrency", link: "#concurrency" },
            { name: "Storage", link: "#storage" },
            { name: "Docker", link: "#docker" }
        ]
    },
    {
        name: "Frequently Asked Questions",
        link: "/desktop/faq",
        children: [
            { name: "FAQ", link: "#faq" }
        ]
    }
]
</script>

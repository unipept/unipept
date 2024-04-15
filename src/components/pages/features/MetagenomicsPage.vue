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
        name: "Overview",
        link: "/umgap",
        children: [
            { name: "Functionality", link: "#functionality" },
            { name: "Installation", link: "#installation" },
            { name: "Updates", link: "#updates" },
            { name: "Configuration", link: "#configuration" }
        ]
    },
    {
        name: "Case studies",
        link: "/umgap/casestudies",
        children: [
            { name: "Preconfigured pipelines", link: "/umgap/casestudies/basic" },
            { name: "Advanced configuration", link: "/umgap/casestudies/advanced" },
            { name: "Comparative analysis", link: "/umgap/casestudies/comparative" }
        ]
    },
    { name: "fastq2fasta", link: "/umgap/fastq2fasta" },
    { name: "translate", link: "/umgap/translate" },
    { name: "prot2tryp", link: "/umgap/prot2tryp" },
    { name: "prot2kmer", link: "/umgap/prot2kmer" },
    { name: "filter", link: "/umgap/filter" },
    { name: "pept2lca", link: "/umgap/pept2lca" },
    { name: "prot2tryp2lca", link: "/umgap/prot2tryp2lca" },
    { name: "prot2kmer2lca", link: "/umgap/prot2kmer2lca" },
    { name: "bestof", link: "/umgap/bestof" },
    { name: "seedextend", link: "/umgap/seedextend" },
    { name: "uniq", link: "/umgap/uniq" },
    { name: "taxa2agg", link: "/umgap/taxa2agg" },
    { name: "snaptaxon", link: "/umgap/snaptaxon" },
    { name: "taxa2freq", link: "/umgap/taxa2freq" },
    { name: "taxa2tree", link: "/umgap/taxa2tree" },
    { name: "taxonomy", link: "/umgap/taxonomy" },
    { name: "splitkmers", link: "/umgap/splitkmers" },
    { name: "joinkmers", link: "/umgap/joinkmers" },
    { name: "buildindex", link: "/umgap/buildindex" },
    { name: "printindex", link: "/umgap/printindex" },
];
</script>

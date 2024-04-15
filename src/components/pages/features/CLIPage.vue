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
                    class="col-lg-2 order-lg-1 d-sm-none d-lg-flex"
                    :items="navigation"
                />
                <horizontal-navigation
                    v-else
                    class="col-12 order-0"
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
        link: "/clidocs",
        children: [
            { name: "Functionality", link: "#functionality" },
            { name: "Installation", link: "#installation" },
            { name: "Updates", link: "#updates" },
            { name: "Configuration", link: "#configuration" }
        ]
    },
    {
        name: "Case studies",
        link: "/clidocs/casestudies",
        children: [
            { name: "Tryptic peptide", link: "/clidocs/casestudies/tpa" },
            { name: "Metaproteomics data", link: "/clidocs/casestudies/mpa" }
        ]
    },
    {
        name: "uniprot",
        link: "/clidocs/uniprot",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "prot2pept",
        link: "/clidocs/prot2pept",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Fasta", link: "#fasta" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "peptfilter",
        link: "/clidocs/peptfilter",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Fasta", link: "#fasta" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "unipept pept2lca",
        link: "/clidocs/pept2lca",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Fasta", link: "#fasta" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "unipept pept2prot",
        link: "/clidocs/pept2prot",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Fasta", link: "#fasta" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "unipept pept2taxa",
        link: "/clidocs/pept2taxa",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Fasta", link: "#fasta" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "unipept pept2ec",
        link: "/clidocs/pept2ec",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Fasta", link: "#fasta" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "unipept pept2go",
        link: "/clidocs/pept2go",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Fasta", link: "#fasta" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "unipept pept2interpro",
        link: "/clidocs/pept2interpro",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Fasta", link: "#fasta" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "unipept pept2funct",
        link: "/clidocs/pept2funct",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Fasta", link: "#fasta" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "unipept peptinfo",
        link: "/clidocs/peptinfo",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Fasta", link: "#fasta" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "unipept taxa2lca",
        link: "/clidocs/taxa2lca",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "unipept taxa2tree",
        link: "/clidocs/taxa2tree",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Options", link: "#options" }
        ]
    },
    {
        name: "unipept taxonomy",
        link: "/clidocs/taxonomy",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
            { name: "Fasta", link: "#fasta" },
            { name: "Options", link: "#options" }
        ]
    }
];
</script>

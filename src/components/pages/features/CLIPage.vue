<template>
    <v-container style="max-width: 1200px;">
        <v-row>
            <div class="col-lg-10 order-lg-0 order-1 pt-0">
                <router-view></router-view>
            </div>
            <VerticalNavigation v-if="$vuetify.breakpoint.lgAndUp" class="col-lg-2 order-lg-1 d-sm-none d-lg-flex" :items="navigation"/>
            <HorizontalNavigation v-else class="col-12 order-0" :items="navigation" />
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import VerticalNavigation from "@/components/navigation/VerticalNavigation.vue";
import HorizontalNavigation from "@/components/navigation/HorizontalNavigation.vue";

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
        name: "unipept protinfo",
        link: "/clidocs/protinfo",
        children: [
            { name: "Input", link: "#input" },
            { name: "Output", link: "#output" },
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

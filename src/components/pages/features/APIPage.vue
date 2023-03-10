<template>
    <v-container style="max-width: 1200px;">
        <v-row>
            <div class="col-lg-10 order-lg-0 order-1 pt-0">
                <router-view></router-view>
            </div>
            <VerticalNavigation v-if="$vuetify.breakpoint.lgAndUp" class="col-lg-2 order-lg-1 d-sm-none d-lg-flex" :items="navigation" />
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
        link: "/apidocs",
        children: [
            { name: "Functionality", link: "#functionality" }
        ]
    },
    {
        name: "pept2prot",
        link: "/apidocs/pept2prot",
        children: [
            { name: "Request", link: "#request" },
            { name: "Response", link: "#response" },
            { name: "Parameters", link: "#parameters" },
            { name: "Examples", link: "#examples" },
            { name: "Try it", link: "#try" }
        ]
    },
    {
        name: "pept2taxa",
        link: "/apidocs/pept2taxa",
        children: [
            { name: "Request", link: "#request" },
            { name: "Response", link: "#response" },
            { name: "Parameters", link: "#parameters" },
            { name: "Examples", link: "#examples" },
            { name: "Try it", link: "#try" }
        ]
    },
    {
        name: "pept2lca",
        link: "/apidocs/pept2lca",
        children: [
            { name: "Request", link: "#request" },
            { name: "Response", link: "#response" },
            { name: "Parameters", link: "#parameters" },
            { name: "Examples", link: "#examples" },
            { name: "Try it", link: "#try" }
        ]
    },
    {
        name: "pept2ec",
        link: "/apidocs/pept2ec",
        children: [
            { name: "Request", link: "#request" },
            { name: "Response", link: "#response" },
            { name: "Parameters", link: "#parameters" },
            { name: "Examples", link: "#examples" },
            { name: "Try it", link: "#try" }
        ]
    },
    {
        name: "pept2go",
        link: "/apidocs/pept2go",
        children: [
            { name: "Request", link: "#request" },
            { name: "Response", link: "#response" },
            { name: "Parameters", link: "#parameters" },
            { name: "Examples", link: "#examples" },
            { name: "Try it", link: "#try" }
        ]
    },
    {
        name: "pept2interpro",
        link: "/apidocs/pept2interpro",
        children: [
            { name: "Request", link: "#request" },
            { name: "Response", link: "#response" },
            { name: "Parameters", link: "#parameters" },
            { name: "Examples", link: "#examples" },
            { name: "Try it", link: "#try" }
        ]
    },
    {
        name: "pept2funct",
        link: "/apidocs/pept2funct",
        children: [
            { name: "Request", link: "#request" },
            { name: "Response", link: "#response" },
            { name: "Parameters", link: "#parameters" },
            { name: "Examples", link: "#examples" },
            { name: "Try it", link: "#try" }
        ]
    },
    {
        name: "peptinfo",
        link: "/apidocs/peptinfo",
        children: [
            { name: "Request", link: "#request" },
            { name: "Response", link: "#response" },
            { name: "Parameters", link: "#parameters" },
            { name: "Examples", link: "#examples" },
            { name: "Try it", link: "#try" }
        ]
    },
    {
        name: "taxa2lca",
        link: "/apidocs/taxa2lca",
        children: [
            { name: "Request", link: "#request" },
            { name: "Response", link: "#response" },
            { name: "Parameters", link: "#parameters" },
            { name: "Examples", link: "#examples" },
            { name: "Try it", link: "#try" }
        ]
    },
    {
        name: "taxa2tree",
        link: "/apidocs/taxa2tree",
        children: [
            { name: "Request", link: "#request" },
            { name: "Response", link: "#response" },
            { name: "Parameters", link: "#parameters" },
            { name: "Examples", link: "#examples" },
            { name: "Try it", link: "#try" }
        ]
    },
    {
        name: "taxonomy",
        link: "/apidocs/taxonomy",
        children: [
            { name: "Request", link: "#request" },
            { name: "Response", link: "#response" },
            { name: "Parameters", link: "#parameters" },
            { name: "Examples", link: "#examples" },
            { name: "Try it", link: "#try" }
        ]
    }
];
</script>

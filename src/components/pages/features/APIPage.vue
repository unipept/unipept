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

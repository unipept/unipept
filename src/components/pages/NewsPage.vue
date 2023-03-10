<template>
    <v-container>
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
    { name: "Overview", link: "/news" },
    { name: "API", link: "/news/api" },
    { name: "CLI", link: "/news/cli" },
    { name: "Web", link: "/news/web" },
    { name: "Desktop", link: "/news/desktop" },
];
</script>

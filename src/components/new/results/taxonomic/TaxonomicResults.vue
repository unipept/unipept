<template>
    <v-card>
        <v-tabs
            v-model="currentTab"
            bg-color="primary"
            slider-color="secondary"
        >
            <v-tab text="Sunburst" />
            <v-tab text="Treemap" />
            <v-tab text="Treeview" />
            <v-tab text="Hierarchical outline" />
            <v-tab text="Heatmap" />
        </v-tabs>

        <v-card-text class="pa-0">
            <v-tabs-window v-model="currentTab">
                <v-tabs-window-item class="fixed-height">
                    <sunburst :ncbi-root="analysis.ncbiTree" />
                </v-tabs-window-item>

                <v-tabs-window-item class="fixed-height">
                    <treemap :ncbi-root="analysis.ncbiTree" />
                </v-tabs-window-item>

                <v-tabs-window-item class="fixed-height">
                    <treeview :ncbi-root="analysis.ncbiTree" />
                </v-tabs-window-item>

                <v-tabs-window-item>
                    4
                </v-tabs-window-item>

                <v-tabs-window-item>
                    5
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import Sunburst from "@/components/new/results/taxonomic/Sunburst.vue";
import Treemap from "@/components/new/results/taxonomic/Treemap.vue";
import Treeview from "@/components/new/results/taxonomic/Treeview.vue";

defineProps<{
    analysis: SingleAnalysisStore
}>();

const currentTab = ref(0);
</script>

<style scoped>
.fixed-height {
    height: 500px;
}
</style>

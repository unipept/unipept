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
            <v-tab text="Peptonizer" />
        </v-tabs>

        <v-card-text class="pa-0">
            <v-tabs-window v-model="currentTab">
                <v-tabs-window-item class="fixed-height">
                    <sunburst :ncbi-root="analysis.ncbiTree!" />
                </v-tabs-window-item>

                <v-tabs-window-item class="fixed-height">
                    <treemap :ncbi-root="analysis.ncbiTree!" />
                </v-tabs-window-item>

                <v-tabs-window-item class="fixed-height">
                    <treeview :ncbi-root="analysis.ncbiTree!" />
                </v-tabs-window-item>

                <v-tabs-window-item>
                    <hierarchical-outline :analysis="analysis" />
                </v-tabs-window-item>

                <v-tabs-window-item>
                    <heatmap-wizard
                        :analysis="analysis"
                    />
                </v-tabs-window-item>

                <v-tabs-window-item>
                    <peptonizer-analysis
                        :peptide-count-table="analysis.peptidesTable!"
                        :peptide-intensities="analysis.intensities!"
                        :equate-il="analysis.config.equate"
                        :peptonizer-store="analysis.peptonizerStore"
                    />
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
import HierarchicalOutline from "@/components/new/results/taxonomic/HierarchicalOutline.vue";
import HeatmapWizard from "@/components/new/results/taxonomic/heatmap/HeatmapWizard.vue";
import PeptonizerAnalysis from "@/components/new/results/taxonomic/peptonizer/PeptonizerAnalysis.vue";

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

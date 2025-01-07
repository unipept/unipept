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
            <v-tab>
                Peptonizer
                <v-tooltip>
                    <template #activator="{ props: tooltip }">
                        <v-icon v-bind="tooltip" class="ml-2" color="yellow">
                            mdi-creation-outline
                        </v-icon>
                    </template>
                    <span>
                        New since Unipept 6.1.0!
                    </span>
                </v-tooltip>
            </v-tab>
        </v-tabs>

        <v-card-text class="pa-0">
            <v-tabs-window v-model="currentTab">
                <v-tabs-window-item class="fixed-height">
                    <sunburst
                        v-model="filterId"
                        :ncbi-root="analysis.ncbiTree!"
                    />
                </v-tabs-window-item>

                <v-tabs-window-item class="fixed-height">
                    <treemap
                        v-model="filterId"
                        :ncbi-root="analysis.ncbiTree!"
                    />
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
import {ref, watch} from "vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import Sunburst from "@/components/new/results/taxonomic/Sunburst.vue";
import Treemap from "@/components/new/results/taxonomic/Treemap.vue";
import Treeview from "@/components/new/results/taxonomic/Treeview.vue";
import HierarchicalOutline from "@/components/new/results/taxonomic/HierarchicalOutline.vue";
import HeatmapWizard from "@/components/new/results/taxonomic/heatmap/HeatmapWizard.vue";
import PeptonizerAnalysis from "@/components/new/results/taxonomic/peptonizer/PeptonizerAnalysis.vue";

const props = defineProps<{
    analysis: SingleAnalysisStore
}>();

const filterId = ref<number>(props.analysis.taxonomicFilter || 1);

const currentTab = ref(0);

watch(() => filterId.value, (value) => {
    props.analysis.updateTaxonomicFilter(value);
});

watch(() => props.analysis.taxonomicFilter, (value) => {
    filterId.value = value;
});
</script>

<style scoped>
.fixed-height {
    height: 500px;
}
</style>

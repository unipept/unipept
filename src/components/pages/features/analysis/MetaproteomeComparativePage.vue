<template>
    <project-view
        v-model:manage-samples="manageSamplesDialogOpen"
        v-model:selected-analyses="comparativeAnalysisState.selectedAnalyses"
        v-model:selected-group="comparativeAnalysisState.selectedGroup"
        :project="project"
        :is-demo-mode="isDemoMode"
        :multi-select="true"
    >
        <template v-if="!project.empty">
            <template v-if="!comparativeAnalysisState.selectedAnalyses || comparativeAnalysisState.selectedAnalyses.length === 0">
                <v-empty-state
                  headline="No sample selected"
                  title="Select at least one sample from the left sidebar to start the comparative analysis."
                  icon="mdi-beaker-question-outline"
                />
            </template>
            <template v-else>
                <comparative-summary
                    :selected-analyses="comparativeAnalysisState.selectedAnalyses"
                    :groups="project.groups"
                />

                <v-unipept-card class="mt-4 pa-0">
                    <v-tabs
                        v-model="selectedComparativeTab"
                        bg-color="primary"
                        slider-color="secondary"
                    >
                        <v-tab text="Barplot"></v-tab>
                        <v-tab text="Heatmap"></v-tab>
                    </v-tabs>
                    <v-card-text class="pa-0">
                        <v-tabs-window v-model="selectedComparativeTab">
                            <v-tabs-window-item>
                                <taxonomic-barplot :analyses="comparativeAnalysisState.selectedAnalyses" comparative />
                            </v-tabs-window-item>
                            <v-tabs-window-item>
                                <div>Heatmap!</div>
                            </v-tabs-window-item>
                        </v-tabs-window>
                    </v-card-text>
                </v-unipept-card>
            </template>
        </template>
    </project-view>
</template>

<script setup lang="ts">
import ProjectView from "@/components/project/ProjectView.vue";
import {ref, Ref} from "vue";
import ComparativeSummary from "@/components/analysis/comparative/ComparativeSummary.vue";
import TaxonomicBarplot from "@/components/results/taxonomic/TaxonomicBarplot.vue";
import useAppStateStore from "@/store/AppStateStore";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";

const manageSamplesDialogOpen = ref(false);
const selectedComparativeTab = ref(0);

const {
    project,
    isDemoMode
} = useUnipeptAnalysisStore();

const {
    comparativeAnalysisState,
} = useAppStateStore();
</script>

<style scoped>

</style>

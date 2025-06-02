<template>
    <project-view
        v-model:manage-samples="manageSamplesDialogOpen"
        v-model:selected-analyses="selectedAnalyses"
        v-model:selected-group="selectedGroup"
        :project="project"
        :is-demo-mode="isDemoMode"
        :multi-select="true"
    >
        <template v-if="!project.empty">
            <template v-if="!selectedAnalyses || selectedAnalyses.length === 0">
                <v-empty-state
                  headline="No sample selected"
                  title="Select at least one sample from the left sidebar to start the comparative analysis."
                  icon="mdi-beaker-question-outline"
                />
            </template>
            <template v-else>
                <comparative-summary
                    :selected-analyses="selectedAnalyses"
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
                                <taxonomic-barplot :analyses="selectedAnalyses" comparative />
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
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {ref, Ref} from "vue";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";
import ComparativeSummary from "@/components/analysis/comparative/ComparativeSummary.vue";
import TaxonomicBarplot from "@/components/results/taxonomic/TaxonomicBarplot.vue";

const manageSamplesDialogOpen = ref(false);

const selectedAnalyses: Ref = ref<SingleAnalysisStore[]>([]);
const selectedGroup = ref<GroupAnalysisStore | undefined>();

const selectedComparativeTab: Ref<number> = ref(0);

const { project, isDemoMode } = useUnipeptAnalysisStore();

</script>

<style scoped>

</style>

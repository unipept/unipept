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
            <template v-if="!comparativeAnalysisState.selectedAnalyses || comparativeAnalysisState.selectedAnalyses.length < 2">
                <no-selected-samples-placeholder />
            </template>
            <template v-else-if="areAllFinished">
                <comparative-summary
                    v-model:selected-analyses="comparativeAnalysisState.selectedAnalyses"
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
                                <comparative-heatmap :analyses="comparativeAnalysisState.selectedAnalyses" />
                            </v-tabs-window-item>
                        </v-tabs-window>
                    </v-card-text>
                </v-unipept-card>
            </template>
            <div
                v-else-if="isAnalysing"
                class="d-flex align-center justify-center h-100"
            >
                <analysis-summary-progress />
            </div>
            <template v-else-if="hasSomeFailed">
                <v-alert
                    variant="tonal"
                    type="error"
                    class="my-2"
                >
                    <div>
                        An error occurred during the analysis of one or more samples. Check the single analysis page for
                        more information about what might have caused this error.
                    </div>
                    <v-btn variant="flat" class="float-right mt-4" @click="reanalyseFailedSamples()">
                        Reanalyse failed samples
                    </v-btn>
                </v-alert>
            </template>
        </template>
    </project-view>
</template>

<script setup lang="ts">
import ProjectView from "@/components/project/ProjectView.vue";
import {computed, ref, Ref} from "vue";
import ComparativeSummary from "@/components/analysis/comparative/ComparativeSummary.vue";
import TaxonomicBarplot from "@/components/results/taxonomic/TaxonomicBarplot.vue";
import useAppStateStore from "@/store/AppStateStore";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";
import NoSelectedSamplesPlaceholder from "@/components/analysis/comparative/NoSelectedSamplesPlaceholder.vue";
import {AnalysisStatus} from "@/store/AnalysisStatus";
import AnalysisSummaryProgress from "@/components/analysis/multi/AnalysisSummaryProgress.vue";
import ComparativeHeatmap from "@/components/analysis/comparative/ComparativeHeatmap.vue";

const manageSamplesDialogOpen = ref(false);
const selectedComparativeTab = ref(0);

const {
    project,
    isDemoMode
} = useUnipeptAnalysisStore();

const {
    comparativeAnalysisState,
} = useAppStateStore();

// Are all samples finished with their analysis?
const areAllFinished = computed(() => comparativeAnalysisState.selectedAnalyses.every(s => s.status === AnalysisStatus.Finished));

// Are one or more samples still being analysed?
const isAnalysing = computed(() => comparativeAnalysisState.selectedAnalyses.some(s => s.status === AnalysisStatus.Pending || s.status === AnalysisStatus.Running));

// Did one or more of the selected samples fail?
const hasSomeFailed = computed(() => comparativeAnalysisState.selectedAnalyses.some(s => s.status === AnalysisStatus.Failed));

const reanalyseFailedSamples = () => {
    for (const sample of comparativeAnalysisState.selectedAnalyses) {
        if (sample.status === AnalysisStatus.Failed) {
            sample.analyse();
        }
    }
}
</script>

<style scoped>

</style>

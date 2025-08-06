<template>
    <project-view
        v-model:manage-samples="manageSamplesDialog"
        v-model:selected-analyses="singleAnalysisState.selectedAnalyses"
        v-model:selected-group="singleAnalysisState.selectedGroup"
        :project="project"
    >
        <template v-if="project && !project.empty">
            <div v-if="selectedAnalysisFailed">
                <v-alert
                    variant="tonal"
                    type="error"
                    class="my-2"
                >
                    <div>
                        An error occurred while analysing this sample. Please try again.
                        You can contact us if the issue persists.
                    </div>
                    <div class="font-weight-bold">
                        Error details:
                    </div>
                    <pre>{{ selectedAnalysis.analysisError }}</pre>
                    <v-btn variant="flat" class="float-right" @click="reanalyseSample(selectedAnalysis)">
                        Reanalyse sample
                    </v-btn>
                </v-alert>
            </div>

            <div
                v-else-if="!selectedAnalysisFinished"
                class="d-flex align-center justify-center h-100"
            >
                <analysis-summary-progress />
            </div>

            <div v-else>
                <div
                    v-if="selectedAnalysisFiltered"
                    class="position-sticky py-5 mt-n5 mx-n2"
                    style="width: inherit; z-index: 1000; top: 110px; background-color: #F9FAFC;"
                >
                    <v-alert
                        variant="tonal"
                        type="info"
                    >
                        <div
                            class="d-flex justify-space-between align-center"
                            style="width: inherit;"
                        >
                            <span>
                                <b>Filtered results:</b> these results are limited to the all peptides specific
                                to <b>{{ selectedAnalysis.filteredOrganism!.name }} ({{ selectedAnalysis.filteredOrganism!.extra.rank }})</b>
                            </span>
                            <v-btn
                                text="Reset filter"
                                variant="outlined"
                                size="small"
                                @click="resetTaxonomicFilter"
                            />
                        </div>
                    </v-alert>
                </div>

                <analysis-summary
                    v-if="singleAnalysisState.selectedGroup"
                    :analysis="selectedAnalysis"
                    :group="singleAnalysisState.selectedGroup"
                    @edit="manageSamplesDialog = [true, singleAnalysisState.selectedGroup]"
                />

                <taxonomic-results
                    class="mt-5"
                    :analysis="selectedAnalysis"
                />

                <mpa-functional-results
                    class="mt-5"
                    :analysis="selectedAnalysis"
                />
            </div>
        </template>
    </project-view>
</template>

<script setup lang="ts">
import ProjectView from "@/components/project/ProjectView.vue";
import AnalysisSummaryProgress from "@/components/analysis/multi/AnalysisSummaryProgress.vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {computed, ComputedRef, Ref, ref} from "vue";
import AnalysisSummary from "@/components/analysis/multi/AnalysisSummary.vue";
import TaxonomicResults from "@/components/results/taxonomic/TaxonomicResults.vue";
import MpaFunctionalResults from "@/components/results/functional/MpaFunctionalResults.vue";
import {AnalysisStatus} from "@/store/AnalysisStatus";
import useAppStateStore from "@/store/AppStateStore";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";

export interface Sample {
    name: string;
    rawPeptides: string;
}

const { project } = useUnipeptAnalysisStore();

const {
    singleAnalysisState
} = useAppStateStore();

const manageSamplesDialog = ref([false, undefined]);

const selectedAnalysis: ComputedRef = computed(() => singleAnalysisState.selectedAnalyses[0]);

const selectedAnalysisFinished = computed(() => {
    return selectedAnalysis.value && selectedAnalysis.value.status === AnalysisStatus.Finished;
});

const selectedAnalysisFiltered = computed(() => {
    return selectedAnalysis.value && selectedAnalysis.value.taxonomicFilter !== 1;
});

const selectedAnalysisFailed = computed(() => {
    return selectedAnalysis.value && selectedAnalysis.value.status === AnalysisStatus.Failed;
});

const resetTaxonomicFilter = () => {
    singleAnalysisState.selectedAnalyses.forEach((analysis: SingleAnalysisStore) => analysis.updateTaxonomicFilter(1));
}

const reanalyseSample = (analysis: SingleAnalysisStore) => {
    analysis.analyse();
}
</script>

<style scoped>

</style>

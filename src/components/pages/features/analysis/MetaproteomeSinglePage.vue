<template>
    <project-view
        v-model:manage-samples="manageSamplesDialogOpen"
        v-model:selected-analyses="selectedAnalyses"
        v-model:selected-group="selectedGroup"
        :project="project"
        :is-demo-mode="isDemoMode"
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
                    class="position-sticky bg-white py-5 mt-n5 mx-n2"
                    style="width: inherit; z-index: 1000; top: 110px"
                >
                    <v-alert
                        variant="tonal"
                        type="info"
                    >
                        <div
                            class="d-flex justify-space-between align-center"
                            style="width: inherit"
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
                    v-if="selectedGroup"
                    :analysis="selectedAnalysis"
                    :group="selectedGroup"
                    @edit="manageSamplesDialogOpen = true"
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
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";
import AnalysisSummaryProgress from "@/components/analysis/multi/AnalysisSummaryProgress.vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {computed, ComputedRef, Ref, ref} from "vue";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import AnalysisSummary from "@/components/analysis/multi/AnalysisSummary.vue";
import TaxonomicResults from "@/components/results/taxonomic/TaxonomicResults.vue";
import MpaFunctionalResults from "@/components/results/functional/MpaFunctionalResults.vue";
import {AnalysisStatus} from "@/store/AnalysisStatus";

export interface Sample {
    name: string;
    rawPeptides: string;
}

const { project, isDemoMode } = useUnipeptAnalysisStore();

const manageSamplesDialogOpen = ref(false);

const selectedAnalyses: Ref = ref<SingleAnalysisStore[]>([]);
const selectedGroup = ref<GroupAnalysisStore | undefined>();

const selectedAnalysis: ComputedRef = computed(() => selectedAnalyses.value?.[0]);

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
    selectedAnalyses.value?.forEach((analysis: SingleAnalysisStore) => analysis.updateTaxonomicFilter(1));
}

const reanalyseSample = (analysis: SingleAnalysisStore) => {
    analysis.analyse();
}
</script>

<style scoped>

</style>

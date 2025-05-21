<template>
    <v-navigation-drawer permanent>
        <filesystem
            v-model="selectedAnalyses"
            :project="project"
            @sample:add="addSample"
            @sample:update="updateSample"
            @sample:remove="removeSample"
            @group:update="updateGroup"
            @group:remove="removeGroup"
        />

        <template #append>
            <div class="d-flex justify-center pa-3">
                <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    text="Add group"
                    @click="addGroup(`${DEFAULT_NEW_GROUP_NAME} ${project.findFirstAvailableGroupNumber()}`)"
                />
            </div>
        </template>
    </v-navigation-drawer>

    <v-container
        fluid
        class="h-100"
    >
        <new-project
            v-if="project.empty"
            @group:add="addGroup(`${DEFAULT_NEW_GROUP_NAME} ${project.findFirstAvailableGroupNumber()}`)"
        />

        <div v-else-if="selectedAnalysisFailed">
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

            <manage-sample-group
                v-if="selectedGroup"
                v-model="manageSamplesDialogOpen"
                :group="selectedGroup"
                @sample:add="addSample"
                @sample:update="updateSample"
                @sample:remove="removeSample"
                @group:update="updateGroup"
                @group:remove="removeGroup"
            />
        </div>
    </v-container>
</template>

<script setup lang="ts">
import AnalysisSummaryProgress from "@/components/analysis/multi/AnalysisSummaryProgress.vue";
import Filesystem from "@/components/filesystem/Filesystem.vue";
import MpaFunctionalResults from "@/components/results/functional/MpaFunctionalResults.vue";
import AnalysisSummary from "@/components/analysis/multi/AnalysisSummary.vue";
import TaxonomicResults from "@/components/results/taxonomic/TaxonomicResults.vue";
import {computed, ComputedRef, onMounted, Ref, ref} from "vue";
import {SampleTableItem} from "@/components/sample/SampleTable.vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {DEFAULT_NEW_GROUP_NAME, ProjectAnalysisStore} from "@/store/ProjectAnalysisStore";
import NewProject from "@/components/project/NewProject.vue";
import {AnalysisStatus} from "@/store/AnalysisStatus";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import ManageSampleGroup from "@/components/sample/ManageSampleGroup.vue";

const { project } = defineProps<{
    project: ProjectAnalysisStore;
}>();

const emits = defineEmits<{
    (e: 'sample:add', groupId: string, sample: SampleTableItem): void;
    (e: 'sample:update', groupId: string, analysisId: string, updatedSample: SampleTableItem): void;
    (e: 'sample:remove', groupId: string, analysisId: string): void;
    (e: 'group:add', name: string): void;
    (e: 'group:update', groupId: string, updatedName: string): void;
    (e: 'group:remove', groupId: string):  void;
}>();

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
})

const addSample = (groupId: string, sample: SampleTableItem) => {
    if (project.empty) {
        emits('sample:add', groupId, sample);
        selectFirstAnalysis();
    } else {
        emits('sample:add', groupId, sample);
    }
}

const removeSample = (groupId: string, analysisId: string) => {
    emits('sample:remove', groupId, analysisId);
    selectFirstAnalysis();
}

const updateSample = (groupId: string, analysisId: string, updatedSample: SampleTableItem) => {
    emits('sample:update', groupId, analysisId, updatedSample);
}

const addGroup = (name: string) => {
    emits('group:add', name);
}

const updateGroup = (groupId: string, updatedName: string) => {
    emits('group:update', groupId, updatedName);
}

const removeGroup = (groupId: string) => {
    emits('group:remove', groupId);
    selectFirstAnalysis();
}

const resetTaxonomicFilter = () => {
    selectedAnalyses.value?.forEach((analysis: SingleAnalysisStore) => analysis.updateTaxonomicFilter(1));
}

const selectAnalysis = (groupId: string | undefined, analysisId: string | undefined) => {
    if (groupId && analysisId) {
        const analysis = project.getGroup(groupId)?.getAnalysis(analysisId);
        selectedAnalyses.value = analysis ? [ analysis ] : [];
        selectedGroup.value = project.getGroup(groupId);
    }
}

const reanalyseSample = (analysis: SingleAnalysisStore) => {
    analysis.analyse();
}

const isSafari = ref(false);

function detectSafari(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return (
        userAgent.includes("safari") &&
        !userAgent.includes("chrome") &&
        !userAgent.includes("chromium")
    );
}

const selectFirstAnalysis = () => {
    const group = project.getFirstNonEmptyGroup();
    if (group) {
        const analysis = group.getFirstAnalysis();
        if (analysis) {
            selectAnalysis(group.id, analysis.id);
        }
    }
}

onMounted(() => {
    isSafari.value = detectSafari();
    selectFirstAnalysis();
});
</script>

<style scoped>
:deep(.v-list-group__items .v-list-item) {
    padding-inline-start: 40px !important;
}

:deep(.v-list-item__spacer) {
    width: 5px !important;
}
</style>

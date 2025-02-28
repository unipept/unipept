<template>
    <v-navigation-drawer
        permanent
    >
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

    <v-container fluid>
        <new-project
            v-if="project.empty"
            @group:add="addGroup(`${DEFAULT_NEW_GROUP_NAME} ${project.findFirstAvailableGroupNumber()}`)"
        />

        <v-empty-state
            v-else-if="!selectedAnalysis"
            title="No sample selected"
            text="Please select a sample from the sidebar on the left to see its details"
            icon="mdi-flask-outline"
        />

        <div v-else>
            <analysis-summary-progress v-if="!selectedAnalysisFinished" />
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
                    :analysis="selectedAnalysis"
                    :group-name="selectedGroupName!"
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
        </div>
    </v-container>
</template>

<script setup lang="ts">
import AnalysisSummaryProgress from "@/components/analysis/multi/AnalysisSummaryProgress.vue";
import Filesystem from "@/components/filesystem/Filesystem.vue";
import MpaFunctionalResults from "@/components/results/functional/MpaFunctionalResults.vue";
import AnalysisSummary from "@/components/analysis/multi/AnalysisSummary.vue";
import TaxonomicResults from "@/components/results/taxonomic/TaxonomicResults.vue";
import {computed, ComputedRef, onMounted, Ref, ref, watch} from "vue";
import {SampleTableItem} from "@/components/sample/SampleTable.vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import {DEFAULT_NEW_GROUP_NAME, GroupAnalysisStore} from "@/store/new/GroupAnalysisStore";
import NewProject from "@/components/project/NewProject.vue";
import {AnalysisStatus} from "@/store/new/AnalysisStatus";

const { project } = defineProps<{
    project: GroupAnalysisStore;
}>();

const emits = defineEmits<{
    (e: 'sample:add', groupId: string, sample: SampleTableItem): void;
    (e: 'sample:update', groupId: string, analysisId: string, updatedSample: SampleTableItem): void;
    (e: 'sample:remove', groupId: string, analysisId: string): void;
    (e: 'group:add', name: string): void;
    (e: 'group:update', groupId: string, updatedName: string): void;
    (e: 'group:remove', groupId: string):  void;
}>();

const selectedGroupName = ref<string>();
const selectedAnalyses: Ref = ref<SingleAnalysisStore[]>([]);

const selectedAnalysis: ComputedRef = computed(() => selectedAnalyses.value?.[0]);

const selectedAnalysisFinished = computed(() => {
    return selectedAnalysis.value && selectedAnalysis.value.status === AnalysisStatus.Finished;
});

const selectedAnalysisFiltered = computed(() => {
    return selectedAnalysis.value && selectedAnalysis.value.taxonomicFilter !== 1;
});

const addSample = (groupId: string, sample: SampleTableItem) => {
    emits('sample:add', groupId, sample);
}

const removeSample = (groupId: string, analysisId: string) => {
    emits('sample:remove', groupId, analysisId);
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
}

const resetTaxonomicFilter = () => {
    selectedAnalyses.value?.forEach(analysis => analysis.updateTaxonomicFilter(1));
}

const selectAnalysis = (groupId: string | undefined, analysisId: string | undefined) => {
    if (groupId && analysisId) {
        const analysis = project.getGroup(groupId)?.getAnalysis(analysisId);
        selectedAnalyses.value = analysis ? [ analysis ] : [];
    }
    selectedGroupName.value = groupId ? project.getGroup(groupId)?.name : undefined;
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

onMounted(() => {
    isSafari.value = detectSafari();

    const group = project.getFirstGroup();
    if (group) {
        const analysis = group.getFirstAnalysis();
        if (analysis) {
            selectAnalysis(group.id, analysis.id);
        }
    }
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

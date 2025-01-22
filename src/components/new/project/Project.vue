<template>
    <v-navigation-drawer
        permanent
    >
        <filesystem
            :groups="groups"
            @select="selectAnalysis"
            @select:clear="clearSelectedAnalysis"

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
            <analysis-summary-progress v-if="selectedAnalysis && !selectedAnalysisFinished" />
            <div v-if="selectedAnalysis && selectedAnalysisFinished">
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
                                to <b>{{ selectedAnalysis.filteredOrganism.name }} ({{ selectedAnalysis.filteredOrganism.extra.rank }})</b>
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
import AnalysisSummaryProgress from "@/components/new/analysis/AnalysisSummaryProgress.vue";
import Filesystem from "@/components/new/filesystem/Filesystem.vue";
import MpaFunctionalResults from "@/components/new/results/functional/MpaFunctionalResults.vue";
import AnalysisSummary from "@/components/new/analysis/AnalysisSummary.vue";
import TaxonomicResults from "@/components/new/results/taxonomic/TaxonomicResults.vue";
import {computed, onMounted, ref, watch} from "vue";
import {SampleTableItem} from "@/components/new/sample/SampleTable.vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import {DEFAULT_NEW_GROUP_NAME, GroupAnalysisStore} from "@/store/new/GroupAnalysisStore";
import NewProject from "@/components/new/project/NewProject.vue";
import {AnalysisStatus} from "@/store/new/AnalysisStatus";

const { project } = defineProps<{
    project: GroupAnalysisStore;
}>();

const emits = defineEmits<{
    'sample:add': (groupId: string, sample: SampleTableItem) => void;
    'sample:update': (groupId: string, analysisId: string, updatedSample: SampleTableItem) => void;
    'sample:remove': (groupId: string, analysisId: string) => void;
    'group:add': (name: string) => void;
    'group:update': (groupId: string, updatedName: string) => void;
    'group:remove': (groupId: string) => void;
}>();

const selectedGroupName = ref<string>();
const selectedAnalysis = ref<SingleAnalysisStore>();

const groups = computed(() => project.groups);

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
    selectedAnalysis.value?.updateTaxonomicFilter(1);
}

const clearSelectedAnalysis = () => selectedAnalysis.value = undefined;

const selectAnalysis = (groupId: string | undefined, analysisId: string | undefined) => {
    selectedAnalysis.value = groupId && analysisId ? project.getGroup(groupId)?.getAnalysis(analysisId) : undefined;
    selectedGroupName.value = project.getGroup(groupId)?.name;
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

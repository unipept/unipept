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
                    text="Create group"
                    @click="addGroup(`${DEFAULT_NEW_GROUP_NAME} ${findFirstAvailableGroupNumber()}`)"
                />
            </div>
        </template>
    </v-navigation-drawer>

    <v-container fluid>
        <empty-project v-if="project.empty" />

        <div v-else>
            <analysis-summary-progress v-if="selectedAnalysis && !selectedAnalysisFinished" />
            <div v-if="selectedAnalysis && selectedAnalysisFinished">
                <analysis-summary
                    :analysis="selectedAnalysis"
                    :group-name="selectedGroupName"
                />

                <taxonomic-results
                    class="mt-5"
                    :analysis="selectedAnalysis"
                />

                <functional-results
                    class="mt-5"
                    :analysis="selectedAnalysis"
                    @update-filter="updateFunctionalFilter"
                />
            </div>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import AnalysisSummaryProgress from "@/components/new/analysis/AnalysisSummaryProgress.vue";
import Filesystem from "@/components/new/filesystem/Filesystem.vue";
import FunctionalResults from "@/components/new/results/functional/FunctionalResults.vue";
import AnalysisSummary from "@/components/new/analysis/AnalysisSummary.vue";
import TaxonomicResults from "@/components/new/results/taxonomic/TaxonomicResults.vue";
import {computed, ref} from "vue";
import {SampleTableItem} from "@/components/new/sample/SampleTable.vue";
import {AnalysisStatus, SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import {GroupAnalysisStore} from "@/store/new/GroupAnalysisStore";
import EmptyProject from "@/components/new/project/EmptyProject.vue";

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

const DEFAULT_NEW_GROUP_NAME: string = "Group";

const selectedGroupName = ref<string>();
const selectedAnalysis = ref<SingleAnalysisStore>();

const groups = computed(() => project.groups);

const selectedAnalysisFinished = computed(() => {
    return selectedAnalysis.value.status === AnalysisStatus.Finished;
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

const updateFunctionalFilter = async (value: number) => {
    await selectedAnalysis.value?.updateFilter(value);
}

const clearSelectedAnalysis = () => selectedAnalysis.value = undefined;

const selectAnalysis = (groupId: string | undefined, analysisId: string | undefined) => {
    selectedAnalysis.value = groupId && analysisId ? project.getGroup(groupId)?.getAnalysis(analysisId) : undefined;
    selectedGroupName.value = project.getGroup(groupId)?.name;
}

/**
 * Find all groups that have the name
 */
const findFirstAvailableGroupNumber = () => {
    const existingGroupNames: string[] = groups.value.map(g => g.name);
    let counter = 1;
    while (existingGroupNames.includes(`${DEFAULT_NEW_GROUP_NAME} ${counter}`)) {
        counter += 1;
    }
    return counter;
}
</script>

<style scoped>
:deep(.v-list-group__items .v-list-item) {
    padding-inline-start: 40px !important;
}

:deep(.v-list-item__spacer) {
    width: 5px !important;
}
</style>

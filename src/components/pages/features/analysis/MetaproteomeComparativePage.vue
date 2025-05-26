<template>
    <project-view
        v-model:manage-samples="manageSamplesDialogOpen"
        v-model:selected-analyses="selectedAnalyses"
        v-model:selected-group="selectedGroup"
        :project="project"
        :is-demo-mode="isDemoMode"
        :multi-select="true"
    >
        <comparative-summary
            :selected-analyses="selectedAnalyses"
        />
    </project-view>
</template>

<script setup lang="ts">
import ProjectView from "@/components/project/ProjectView.vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {ref, Ref} from "vue";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";
import ComparativeSummary from "@/components/analysis/comparative/ComparativeSummary.vue";

const manageSamplesDialogOpen = ref(false);

const selectedAnalyses: Ref = ref<SingleAnalysisStore[]>([]);
const selectedGroup = ref<GroupAnalysisStore | undefined>();

const { project, isDemoMode } = useUnipeptAnalysisStore();

</script>

<style scoped>

</style>

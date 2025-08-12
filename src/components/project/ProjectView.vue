<template>
    <!-- Persistent mobile toggle button that stays visible when drawer is closed -->
    <v-btn
        v-if="$vuetify.display.mobile && !drawerOpen"
        icon
        variant="tonal"
        color="primary"
        size="small"
        class="mobile-drawer-toggle"
        @click="drawerOpen = !drawerOpen"
        style="position: fixed; bottom: 16px; right: 16px; z-index: 100;"
    >
        <v-icon>mdi-chevron-up</v-icon>
    </v-btn>

    <v-navigation-drawer
        v-model="drawerOpen"
        mobile-breakpoint="md"
        :permanent="!$vuetify.display.mobile"
        :temporary="$vuetify.display.mobile"
        :location="$vuetify.display.mobile ? 'bottom' : undefined"
    >
        <template #prepend>
            <div class="d-flex align-center">
                <v-list-subheader
                    v-if="project.name"
                    class="project-name mt-2 mb-1 px-3 flex-grow-1"
                    style="pointer-events: none; min-height: 40px;"
                    variant="tonal"
                    density="compact"
                >
                    {{ project.name }}
                </v-list-subheader>
                <v-btn
                    v-if="$vuetify.display.mobile"
                    icon
                    variant="text"
                    size="small"
                    class="mr-2"
                    @click="drawerOpen = !drawerOpen"
                >
                    <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
            </div>
            <v-divider class="mx-3" />
        </template>


        <filesystem
            v-model="selectedAnalyses"
            :project="project"
            :multi-select="multiSelect"
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

    <v-container class="py-0" fluid>
        <v-alert
            v-if="project.isDemoMode"
            type="info"
        >
            You are currently in <b>demo</b> mode. Changes made to the project will not be saved.
            To save your changes, click
            <span
                class="text-white text-decoration-underline font-weight-bold cursor-pointer"
                @click="newDialogOpen = true"
            >here</span>
            to create a new project.
        </v-alert>

        <new-project-dialog
            v-model="newDialogOpen"
            :project-exists="projectExists"
            @project:new="convertToProject"
        />
    </v-container>

    <v-container
        fluid
        class="h-100"
    >
        <empty-project-placeholder
            v-if="project.empty"
            @group:add="addGroup(`${DEFAULT_NEW_GROUP_NAME} ${project.findFirstAvailableGroupNumber()}`)"
        />

        <!-- Content that should be shown for this project (information about a single sample, or multiple samples?) -->
        <slot></slot>
        
        <manage-sample-group-dialog
            v-if="manageSamples[1]"
            v-model="manageSamples[0]"
            :group="manageSamples[1]"
            @sample:add="addSample"
            @sample:update="updateSample"
            @sample:remove="removeSample"
            @group:update="updateGroup"
            @group:remove="removeGroup"
        />
    </v-container>
</template>

<script setup lang="ts">
import Filesystem from "@/components/filesystem/Filesystem.vue";
import {onMounted, ref} from "vue";
import {SampleTableItem} from "@/components/sample/SampleTable.vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {DEFAULT_NEW_GROUP_NAME, ProjectAnalysisStore} from "@/store/ProjectAnalysisStore";
import EmptyProjectPlaceholder from "@/components/project/EmptyProjectPlaceholder.vue";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import ManageSampleGroupDialog from "@/components/sample/ManageSampleGroupDialog.vue";
import NewProjectDialog from "@/components/analysis/multi/NewProjectDialog.vue";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";

const { getProjects } = useUnipeptAnalysisStore();

const { project, multiSelect = false } = defineProps<{
    project: ProjectAnalysisStore;
    multiSelect?: boolean;
}>();

const selectedAnalyses = defineModel<SingleAnalysisStore[]>("selected-analyses", { required: true });
const selectedGroup = defineModel<GroupAnalysisStore | undefined>("selected-group", { required: true });
// This model defines whether the manage samples dialog should be open, and which group should be managed by the dialog.
const manageSamples = defineModel<[boolean, GroupAnalysisStore | undefined]>("manage-samples", { default: [false, undefined], required: false });

const newDialogOpen = ref(false);

const drawerOpen = ref(true);

const addGroup = (name: string) => {
    const groupId = project.addGroup(name);
    manageSamples.value = [true, project.getGroup(groupId)];
}

const updateGroup = (groupId: string, updatedName: string) => {
    project.getGroup(groupId)?.updateName(updatedName);
}

const removeGroup = (groupId: string) => {
    project.removeGroup(groupId);
    selectFirstAnalysis();
}

const addSample = (groupId: string, sample: SampleTableItem) => {
    const wasEmpty = project.empty;

    const analysisId = project.getGroup(groupId).addAnalysis(
        sample.name,
        sample.rawPeptides,
        sample.config,
        sample.intensities
    );
    const analysis = project.getGroup(groupId).getAnalysis(analysisId);
    if (!analysis) {
        throw Error(`Could not create a new analysis with the provided properties. Analysis with id ${analysisId} is invalid.`);
    } else {
        analysis.analyse();

        if (wasEmpty) {
            selectFirstAnalysis();
        }
    }
}

const removeSample = (groupId: string, analysisId: string) => {
    project.getGroup(groupId)?.removeAnalysis(analysisId);
    selectFirstAnalysis();
}

const updateSample = (groupId: string, analysisId: string, updatedSample: SampleTableItem) => {
    const analysis = project.getGroup(groupId)?.getAnalysis(analysisId);
    analysis?.updateName(updatedSample.name);
    analysis?.updateConfig(updatedSample.config);
    analysis?.analyse();
}

const selectAnalysis = (analysis: SingleAnalysisStore | undefined) => {
    selectedAnalyses.value = analysis ? [ analysis ] : [];
}

const selectFirstAnalysis = () => {
    const group = project.getFirstNonEmptyGroup();
    if (group) {
        const analysis = group.getFirstAnalysis();
        if (analysis) {
            selectGroup(group.id);
            selectAnalysis(analysis);
        }
    }
};

const selectGroup = (groupId: string) => {
    selectedGroup.value = project.getGroup(groupId);
}

const projectExists = async (name: string) => {
    const projects = await getProjects();
    return projects.some(project => project.name === name);
};

const convertToProject = (projectName: string) => {
    project.setName(projectName);
    project.setDemoMode(false);
};

onMounted(() => {
    if (selectedAnalyses.value.length === 0) {
        selectFirstAnalysis();
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

.project-name {
 font-weight: bold;
 font-size: 1.2em;
}
</style>

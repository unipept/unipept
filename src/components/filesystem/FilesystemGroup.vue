<template>
    <v-divider v-if="showDivider" class="mx-3"/>

    <div class="d-flex flex-row align-center">
        <v-list-subheader>{{ group.name }}</v-list-subheader>
        <v-spacer></v-spacer>
        <v-icon
            class="pe-5"
            color="grey-darken-2"
            icon="mdi-pencil"
            size="small"
            @click="manageSamplesDialogOpen = true"
        />
    </div>

    <v-list-item
        v-for="analysis in group.analyses"
        style="margin: 1px 2px;"
        :key="analysis.id"
        :value="analysis"
        :title="analysis.name"
        color="primary"
        density="compact"
        rounded
    >
        <template #prepend="{ isSelected }">
            <v-tooltip
                v-if="analysis.intensities"
                text="Custom intensity scores for Peptonizer provided">
                <template #activator="{ props }">
                    <v-icon
                        v-if="isSelected"
                        v-bind="props"
                        icon="unipept:file-lightning-outline-check"
                    />
                    <v-icon
                        v-else
                        v-bind="props"
                        icon="unipept:file-lightning-outline"
                    />
                </template>
            </v-tooltip>

            <template v-else>
                <v-icon
                    v-if="isSelected"
                    icon="mdi-file-document-check-outline"
                />
                <v-icon
                    v-else
                    icon="mdi-file-document-outline"
                />
            </template>
        </template>
        <template #append>
            <v-icon
                v-if="analysis.status === AnalysisStatus.Pending"
                icon="mdi-clock-outline"
            />

            <v-progress-circular
                v-else-if="analysis.status === AnalysisStatus.Running"
                color="primary"
                size="20"
                width="3"
                indeterminate
            />

            <v-icon
                v-else-if="analysis.status === AnalysisStatus.Failed"
                color="error"
                icon="mdi-alert-circle"
            />
        </template>
    </v-list-item>

    <v-list-item
        style="margin: 1px 2px;"
        class="text-primary mb-3"
        title="Add new sample"
        color="primary"
        density="compact"
        rounded
        prepend-icon="mdi-file-document-plus-outline"
        :value="`button-${group.id}`"
        :active="false"
        @click="manageSamplesDialogOpen = true"
    />

    <manage-sample-group-dialog
        v-model="manageSamplesDialogOpen"
        :group="group"
        @sample:add="addSample"
        @sample:update="updateSample"
        @sample:remove="removeSample"
        @group:update="updateGroup"
        @group:remove="removeGroup"
    />
</template>

<script setup lang="ts">
import ManageSampleGroupDialog from "@/components/sample/ManageSampleGroupDialog.vue";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import {ref} from "vue";
import {SampleTableItem} from "@/components/sample/SampleTable.vue";
import {AnalysisStatus} from "@/store/AnalysisStatus";

defineProps<{
    group: GroupAnalysisStore,
    showDivider?: boolean
}>();

const emits = defineEmits<{
    (e: "sample:add", groupId: string, sample: SampleTableItem): void;
    (e: "sample:update", groupId: string, analysisId: string, updatedSample: SampleTableItem): void;
    (e: "sample:remove", groupId: string, sampleName: string): void;
    (e: "group:update", groupId: string, updatedName: string): void;
    (e: "group:remove", groupId: string): void;
}>();

const manageSamplesDialogOpen = ref(false);

const addSample = (groupId: string, sample: SampleTableItem) => {
    emits('sample:add', groupId, sample);
};

const updateSample = (groupId: string, analysisId: string, updatedSample: SampleTableItem) => {
    emits('sample:update', groupId, analysisId, updatedSample);
};

const removeSample = (groupId: string, sampleName: string) => {
    emits('sample:remove', groupId, sampleName);
};

const updateGroup = (groupId: string, updatedName: string) => {
    emits('group:update', groupId, updatedName);
};

const removeGroup = (groupId: string) => {
    emits('group:remove', groupId);
};
</script>

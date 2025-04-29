<template>
    <v-list-group :value="group.id">
        <template #activator="{ props }">
            <v-list-item
                base-color="grey-darken-3"
                color="none"
                density="compact"
                variant="tonal"
            >
                <template #title>
                    <div v-bind="props">
                        {{ group.name }}
                    </div>
                </template>

                <template #prepend="{ isOpen }">
                    <v-icon
                        v-if="isOpen"
                        v-bind="props"
                    >
                        mdi-chevron-down
                    </v-icon>
                    <v-icon
                        v-else
                        v-bind="props"
                    >
                        mdi-chevron-right
                    </v-icon>
                </template>

                <template #append>
                    <v-icon
                        color="grey-darken-3"
                        icon="mdi-pencil"
                        size="small"
                        @click="manageSamplesDialogOpen = true"
                    />
                </template>
            </v-list-item>
        </template>

        <v-list-item
            v-for="analysis in group.analyses"
            :key="analysis.id"
            :value="analysis"
            :title="analysis.name"
            color="primary"
            density="compact"
        >
            <template #prepend>
                <v-tooltip
                    v-if="analysis.intensities"
                    text="Custom intensity scores for Peptonizer provided">
                    <template #activator="{ props }">
                        <v-icon
                            v-bind="props"
                            icon="unipept:file-lightning-outline"
                        />
                    </template>
                </v-tooltip>

                <v-icon
                    v-else
                    icon="mdi-file-document-outline"
                />
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
            </template>
        </v-list-item>

        <v-list-item
            class="text-primary"
            title="Add new sample"
            color="primary"
            density="compact"
            prepend-icon="mdi-file-document-plus-outline"
            :value="`button-${group.id}`"
            :active="false"
            @click="manageSamplesDialogOpen = true"
        />

        <manage-sample-group
            v-model="manageSamplesDialogOpen"
            :group="group"
            @sample:add="addSample"
            @sample:update="updateSample"
            @sample:remove="removeSample"
            @group:update="updateGroup"
            @group:remove="removeGroup"
        />
    </v-list-group>
</template>

<script setup lang="ts">
import ManageSampleGroup from "@/components/sample/ManageSampleGroup.vue";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import {ref} from "vue";
import {SampleTableItem} from "@/components/sample/SampleTable.vue";
import {AnalysisStatus} from "@/store/AnalysisStatus";
import {CustomFilterStore} from "@/store/CustomFilterStore";

defineProps<{
    group: GroupAnalysisStore
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

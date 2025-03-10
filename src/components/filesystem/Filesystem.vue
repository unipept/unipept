<template>
    <div
        v-if="!project.groups || project.groups.length === 0"
        class="mt-4 d-flex justify-center"
    >
        No samples added yet...
    </div>

    <v-list
        v-model:opened="expanded"
        v-model:selected="selected"
        class="py-0"
        color="primary"
        selectable
        select-strategy="single-leaf"
        open-strategy="multiple"
        active-strategy="single-leaf"
        mandatory
        @update:selected="selectItem"
    >
        <filesystem-group
            v-for="group in project.groups"
            :key="group.id"
            :group="group"
            @sample:add="addSample"
            @sample:update="updateSample"
            @sample:remove="removeSample"
            @group:update="updateGroup"
            @group:remove="removeGroup"
        />
    </v-list>
</template>

<script setup lang="ts">
import FilesystemGroup from "@/components/filesystem/FilesystemGroup.vue";
import {onMounted, ref, watch} from "vue";
import {SampleTableItem} from "@/components/sample/SampleTable.vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import {GroupAnalysisStore} from "@/store/new/GroupAnalysisStore";

const selected = defineModel<SingleAnalysisStore[]>({ required: true });

const { project } = defineProps<{
    project: GroupAnalysisStore;
}>();

const emits = defineEmits<{
    (e: "sample:add", groupId: string, sample: SampleTableItem):  void;
    (e: "sample:update", groupId: string, analysisId: string, updatedSample: SampleTableItem): void;
    (e: "sample:remove", groupId: string, sampleName: string): void;
    (e: "group:update", groupId: string, updatedName: string): void;
    (e: "group:remove", groupId: string): void;
    (e: "select", groupName: string, analysisName: string): void;
    (e: "select:clear"):  void;
}>();

const expanded = ref<string[]>([]);

const addSample = (groupId: string, sample: SampleTableItem) => {
    emits('sample:add', groupId, sample);
};

const updateSample = (groupId: string, analysisId: string, updatedSample: SampleTableItem) => {
    emits('sample:update', groupId, analysisId, updatedSample);
};

const removeSample = (groupId: string, analysisId: string) => {
    if (analysisId === selected.value[0]?.id) {
        selected.value = [];
    }
    emits('sample:remove', groupId, analysisId);
};

const updateGroup = (groupId: string, updatedName: string) => {
    emits('group:update', groupId, updatedName);
};

const removeGroup = (groupId: string) => {
    if (selected.value.length > 0 && project.getGroup(groupId).getAnalysis(selected.value[0]?.id)) {
        selected.value = [];
    }
    emits('group:remove', groupId);
};

const selectItem = (newSelected: (SingleAnalysisStore | string)[]) => {
    if (typeof newSelected[0] === 'string') {
        // We have to set the selected value to itself to trigger the watcher
        selected.value = [ ...selected.value ];
    }
};

watch(() => project.groups, () => {
    expanded.value = project.groups.map(group => group.id);
});

onMounted(() => {
    expanded.value = project.groups.map(group => group.id);
});
</script>

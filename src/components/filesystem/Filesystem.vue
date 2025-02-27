<template>
    <div
        v-if="!groups || groups.length === 0"
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
    >
        <filesystem-group
            v-for="group in groups"
            :key="group.id"
            :value="group.id"
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
import {MultiAnalysisStore} from "@/store/new/MultiAnalysisStore";
import {SampleTableItem} from "@/components/sample/SampleTable.vue";

const { groups } = defineProps<{
    groups: MultiAnalysisStore[];
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
const selected = ref<string[]>([]);

const addSample = (groupId: string, sample: SampleTableItem) => {
    emits('sample:add', groupId, sample);
};

const updateSample = (groupId: string, analysisId: string, updatedSample: SampleTableItem) => {
    emits('sample:update', groupId, analysisId, updatedSample);
};

const removeSample = (groupId: string, analysisId: string) => {
    if (analysisId === selected.value?.[0]?.split(':')[1]) {
        selected.value = [];
        emits('select:clear');
    }
    emits('sample:remove', groupId, analysisId);
};

const updateGroup = (groupId: string, updatedName: string) => {
    emits('group:update', groupId, updatedName);
};

const removeGroup = (groupId: string) => {
    if (groupId === selected.value?.[0]?.split(':')[0]) {
        selected.value = [];
        emits('select:clear');
    }
    emits('group:remove', groupId);
};

watch(selected, (value) => {
  if (value.length === 1 && value[0].includes(":")) {
        const splitted = value[0].split(':');
        emits('select', splitted[0], splitted[1]);
    }
});

watch(() => groups, () => {
    expanded.value = groups.map(group => group.id);
});

onMounted(() => {
    expanded.value = groups.map(group => group.id);
});
</script>

<style scoped>

</style>

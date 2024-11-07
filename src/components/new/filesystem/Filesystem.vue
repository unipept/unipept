<template>
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
            :key="group.name"
            :value="group.name"
            :group="group"
            @sample:add="emits('sample:add', group.name, $event)"
            @sample:remove="removeSample(group.name, $event)"
            @group:remove="removeGroup(group.name)"
        />
    </v-list>
</template>

<script setup lang="ts">
import FilesystemGroup from "@/components/new/filesystem/FilesystemGroup.vue";
import {SampleTableItem} from "@/components/new/sample/SampleTable.vue";
import {computed, ref, watch} from "vue";
import {MultiAnalysisStore} from "@/store/new/MultiAnalysisStore";

const { groups } = defineProps<{
    groups: MultiAnalysisStore[];
}>();

const emits = defineEmits<{
    "sample:add": (groupName: string, samples: SampleTableItem[]) => void;
    "sample:remove": (groupName: string, analysisName: string) => void;
    "sample:edit": (name: string, newName: string) => void;
    "group:edit": () => void;
    "group:remove": (groupName: string) => void;
    "select": (groupName: string, analysisName: string) => void;
    "select:clear": () => void;
}>();

const expanded = ref<string[]>([]);
const selected = ref<string[]>([]);

const selectedNames = computed(() => {
    if (selected.value.length === 0) {
        return undefined;
    }

    const [ groupId, analysisId ] = selected.value[0].split(':');
    const group = groups.find(group => group.id.toString() === groupId);
    const analysis = group?.analyses.find(analysis => analysis.id.toString() === analysisId);
    return [ group?.name, analysis?.name ];
});

const removeGroup = (groupName: string) => {
    if (selected.value.length === 1 && selectedNames.value[0] === groupName) {
        selected.value = [];
        emits('select:clear');
    }
    emits('group:remove', groupName);
};

const removeSample = (groupName: string, analysisName: string) => {
    if (selected.value.length === 1 && selectedNames.value[0] === groupName && selectedNames.value[1] === analysisName) {
        selected.value = [];
        emits('select:clear');
    }
    emits('sample:remove', groupName, analysisName);
};

watch(selected, (value) => {
    if (value.length === 1) {
        emits('select', ...selectedNames.value);
    }
});

watch(() => groups, () => {
    expanded.value = groups.map(group => group.name);
});
</script>

<style scoped>

</style>

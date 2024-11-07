<template>
    <v-list-group :value="value">
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
                    <v-icon v-if="isOpen" v-bind="props">mdi-chevron-down</v-icon>
                    <v-icon v-else v-bind="props">mdi-chevron-right</v-icon>
                </template>

                <template #append>
                    <group-action-select
                        @sample:add="addAnalysisDialogOpen = true"
                        @group:edit="console.log('group:edit')"
                        @group:remove="removeGroupDialogOpen = true"
                    />
                </template>
            </v-list-item>
        </template>

        <v-list-item
            v-if="group.empty"
            class="text-primary"
            title="Add new sample"
            color="primary"
            density="compact"
            prepend-icon="mdi-file-document-plus-outline"
            :value="`button-${group.name}`"
            :active="false"
            @click="addAnalysisDialogOpen = true"
        />

        <v-list-item
            v-for="analysis in group.analyses"
            v-else
            :key="analysis.id"
            :value="`${group.id}:${analysis.id}`"
            :title="analysis.name"
            color="primary"
            density="compact"
            prepend-icon="mdi-file-document-outline"
        >
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

                <sample-action-select
                    v-else
                    @sample:add="addAnalysisDialogOpen = true"
                    @sample:edit="console.log('sample:edit')"
                    @sample:remove="emits('sample:remove', analysis.name)"
                />
            </template>
        </v-list-item>

        <create-sample
            v-model="addAnalysisDialogOpen"
            @confirm="samples => emits('sample:add', samples)"
        />

        <remove-group-dialog
            v-model="removeGroupDialogOpen"
            :group="group"
            @confirm="emits('group:remove')"
        />
    </v-list-group>
</template>

<script setup lang="ts">
import SampleActionSelect from "@/components/new/filesystem/SampleActionSelect.vue";
import RemoveGroupDialog from "@/components/new/filesystem/RemoveGroupDialog.vue";
import CreateSample from "@/components/new/sample/CreateSample.vue";
import GroupActionSelect from "@/components/new/filesystem/GroupActionSelect.vue";
import {MultiAnalysisStore} from "@/store/new/MultiAnalysisStore";
import {ref} from "vue";
import {SampleTableItem} from "@/components/new/sample/SampleTable.vue";
import {AnalysisStatus} from "@/components/pages/TestPage.vue";

defineProps<{
    group: MultiAnalysisStore;
    value: string;
}>();

const emits = defineEmits<{
    "sample:add": (samples: SampleTableItem[]) => void;
    "sample:remove": (name: string) => void;
    "sample:edit": (name: string, newName: string) => void;
    "group:edit": () => void;
    "group:remove": () => void;
}>();

const addAnalysisDialogOpen = ref(false);
const removeGroupDialogOpen = ref(false);
</script>

<style scoped>

</style>

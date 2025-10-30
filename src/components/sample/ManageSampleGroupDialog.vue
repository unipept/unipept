<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="85%"
        :persistent="!isValid"
    >
        <v-unipept-card v-if="addingSample" class="bg-mainBody">
            <add-sample-stepper
                :is-unique="isUnique"
                @cancel="addingSample = false"
                @confirm="addSamples"
            />
        </v-unipept-card>

        <v-unipept-card
            v-else
            min-height="500px"
            class="bg-mainBody"
        >
            <v-card-title class="d-flex align-center">
                <h2>Manage group</h2>
                <v-spacer />
                <v-btn
                    icon="mdi-close"
                    variant="plain"
                    :disabled="!isValid"
                    @click="confirmChanges"
                />
            </v-card-title>

            <v-card-text class="d-flex flex-column">
                <v-text-field
                    v-model="groupName"
                    class="name-text-field flex-grow-0"
                    color="primary"
                    density="compact"
                    variant="outlined"
                    label="Group name"
                    :rules="[
                        v => !!v || 'Provide a valid name for your group'
                    ]"
                    hide-details="auto"
                />

                <sample-table
                    v-model="samples"
                    class="mt-3"
                />

                <div
                    v-if="!addingSample"
                    class="d-flex justify-center pa-1"
                >
                    <v-btn
                        text="Add new sample"
                        color="primary"
                        variant="text"
                        prepend-icon="mdi-plus"
                        @click="addingSample = true"
                    />
                </div>

                <v-spacer />

                <div class="d-flex">
                    <v-btn
                        class="mr-1"
                        color="error"
                        variant="tonal"
                        text="Remove group"
                        prepend-icon="mdi-delete-outline"
                        @click="removeGroupDialogOpen = true"
                    />
                    <v-btn
                        color="error"
                        variant="text"
                        text="Undo changes"
                        prepend-icon="mdi-undo"
                        :disabled="!canUndo"
                        @click="undoChangesDialogOpen = true"
                    />

                    <v-spacer />

                    <v-btn
                        color="primary"
                        text="Done"
                        variant="tonal"
                        :disabled="!isValid"
                        @click="dialogOpen = false"
                    />
                </div>

                <remove-group-dialog
                    v-model="removeGroupDialogOpen"
                    :group="group"
                    @confirm="removeGroup"
                />

                <undo-changes-dialog
                    v-model="undoChangesDialogOpen"
                    @confirm="undoChanges"
                />
            </v-card-text>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
import SampleTable from "@/components/sample/SampleTable.vue";
import {computed, ref, watch} from "vue";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import RemoveGroupDialog from "@/components/sample/RemoveGroupDialog.vue";
import AddSampleStepper from "@/components/sample/AddSampleStepper.vue";
import UndoChangesDialog from "@/components/sample/UndoChangesDialog.vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {SampleTableItem} from "@/components/sample/SampleTable.vue";

const dialogOpen = defineModel<boolean>();

const { group } = defineProps<{
    group: GroupAnalysisStore
}>();

const emit = defineEmits<{
    (e: 'sample:add', groupId: string, sample: SampleTableItem): void;
    (e: 'sample:update', groupId: string, analysisId: string, updatedSample: SampleTableItem): void;
    (e: 'sample:remove', groupId: string, analysisId: string): void;
    (e: 'group:update', groupId: string, updatedName: string): void;
    (e: 'group:remove', groupId: string): void
}>();

const cloneOriginalSamples = (originalSamples: SingleAnalysisStore[]): SampleTableItem[] => {
    return [...originalSamples].map(sample => ({
        id: sample.id,
        name: sample.name,
        rawPeptides: sample.rawPeptides,
        config: { ...sample.config },
        intensities: sample.intensities
    }));
};

// @ts-ignore At this point, TypeScript has issues figuring out that the parameter is actually of the correct type
const samples = ref<SampleTableItem[]>(cloneOriginalSamples(group.analyses));
const groupName = ref<string>(group.name);
const removeGroupDialogOpen = ref(false);
const undoChangesDialogOpen = ref(false);

const addingSample = ref(false);

const isValid = computed(() => {
    const noneEmpty = samples.value.every(s => s.name && s.rawPeptides);
    const allUnique = samples.value.every(s => samples.value.filter(s2 => s2.name === s.name).length === 1);
    return noneEmpty && allUnique;
});

const canUndo = computed(() =>
    groupName.value !== group.name
    || group.analyses.some(s => !samples.value.find(s2 => s2.id === s.id))
    || samples.value.some(s => {
        const originalAnalysis = group.getAnalysis(s.id);
        return !originalAnalysis || (originalAnalysis && isDirty(originalAnalysis, s));
    })
);

const isUnique = (item: SampleTableItem) => {
    return samples.value!.filter(s => s.id !== item?.id && s.name === item.name).length === 0
};

const confirmChanges = () => {
    // Remove samples that are not in the new list
    for (const sample of group.analyses) {
        if (!samples.value.find(s => s.id === sample.id)) {
            emit('sample:remove', group.id, sample.id);
        }
    }

    // Add or update samples
    for (const sample of samples.value) {
        const originalAnalysis = group.getAnalysis(sample.id);
        if (originalAnalysis) {
            if(isDirty(originalAnalysis, sample)) {
                emit('sample:update', group.id, originalAnalysis.id, sample);
            }
        } else {
            emit('sample:add', group.id, sample);
        }
    }

    // Update the name of the group if it has changed
    if (groupName.value !== group.name) {
        emit('group:update', group.id, groupName.value);
    }

    dialogOpen.value = false;
};

const undoChanges = () => {
    // @ts-ignore At this point, TypeScript has issues figuring out that the parameter is actually of the correct type
    samples.value = cloneOriginalSamples(group.analyses);
    groupName.value = group.name;
};

const removeGroup = () => {
    emit('group:remove', group.id);
    dialogOpen.value = false;
};

const addSamples = (newSamples: SampleTableItem[]) => {
    const lastSampleIndex = samples.value.length - 1;
    if (lastSampleIndex >= 0) {
        newSamples.forEach(s => s.config = {
            equate: samples.value[lastSampleIndex].config.equate,
            filter: samples.value[lastSampleIndex].config.filter,
            missed: samples.value[lastSampleIndex].config.missed,
            database: samples.value[lastSampleIndex].config.database
        });
    }

    samples.value = [...samples.value!, ...newSamples ];
    addingSample.value = false;
};

watch(dialogOpen, () => {
    if (dialogOpen.value) {
        // Reset the samples and group name if the dialog is opened
        undoChanges();
    } else {
        // If the dialog is closed, confirm the changes
        confirmChanges();
    }
    addingSample.value = false;
});

const isDirty = (original: SingleAnalysisStore, current: SampleTableItem): boolean => {
    return original.name !== current.name
        || original.config.equate !== current.config.equate
        || original.config.filter !== current.config.filter
        || original.config.missed !== current.config.missed
        || original.config.database !== current.config.database;
};
</script>

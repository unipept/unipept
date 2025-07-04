<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="600"
        persistent
        @keydown.enter="() => projectName && !projectExists && confirm()"
    >
        <v-unipept-card>
            <v-card-title class="text-h6 font-weight-bold">
                Create a new project
            </v-card-title>

            <v-card-text class="pb-0">
                <v-text-field
                    v-model="projectName"
                    label="Project name"
                    variant="outlined"
                    color="primary"
                    placeholder="Enter a name for your project"
                    required
                    :rules="[
                        v => !!v || 'Project name is required'
                    ]"
                    :error-messages="projectExists ? 'Project name already exists' : ''"
                />
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn variant="text" @click="cancel">Cancel</v-btn>
                <v-btn
                    color="primary"
                    text="Create project"
                    :disabled="!projectName || projectExists"
                    @click="confirm"
                />
            </v-card-actions>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {asyncComputed} from "@vueuse/core";

const dialogOpen = defineModel({ default: false });

const emits = defineEmits<{
    (e: 'project:new', projectName: string): void
}>();

const { projectExists: exists } = defineProps<{
    projectExists: (name: string) => Promise<boolean> | boolean;
}>();

const projectName = ref('');

const projectExists = asyncComputed(() => exists(projectName.value), {
    initialValue: false,
    lazy: true
});

const cancel = () => {
    dialogOpen.value = false;
    projectName.value = '';
};

const confirm = () => {
    dialogOpen.value = false;
    emits('project:new', projectName.value);
    projectName.value = '';
};
</script>

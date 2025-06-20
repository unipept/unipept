<template>
    <div>
        <v-unipept-card>
            <v-card-title>
                <h2>Start a new project</h2>
            </v-card-title>

            <v-card-text>
                <p>
                    Start from scratch with an empty project and analyse your own data.
                </p>

                <div class="d-flex justify-end">
                    <v-btn
                        class="mt-3 float-right"
                        variant="tonal"
                        color="primary"
                        text="Create new project"
                        prepend-icon="mdi-folder-plus-outline"
                        @click="newDialogOpen = true"
                    />
                </div>
            </v-card-text>
        </v-unipept-card>

        <v-dialog
            v-model="newDialogOpen"
            max-width="600"
            persistent
            @keydown.enter="() => projectName && !projectExists(projectName) && newProject()"
        >
            <v-unipept-card>
                <v-card-title class="text-h6 font-weight-bold">
                    Start a new project
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
                            v => !!v || 'Project name is required',
                            v => !projectExists(v) || 'Project name already exists'
                        ]"
                    />
                </v-card-text>

                <v-card-actions class="justify-end">
                    <v-btn variant="text" @click="cancel">Cancel</v-btn>
                    <v-btn
                        color="primary"
                        text="Create project"
                        :disabled="!projectName || projectExists(projectName)"
                        @click="newProject"
                    />
                </v-card-actions>
            </v-unipept-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import {ref} from "vue";

const props = defineProps<{
    projects: { name: string, lastAccessed: Date }[]
}>();

const emits = defineEmits<{
    (e: 'project:new', projectName: string): void
}>();

const newDialogOpen = ref(false);

const projectName = ref('');

const projectExists = (name: string) => {
    return props.projects.some(project => project.name === name);
};

const cancel = () => {
    newDialogOpen.value = false;
    projectName.value = '';
};

const newProject = () => {
    newDialogOpen.value = false;
    emits('project:new', projectName.value);
    projectName.value = '';
};
</script>

<style scoped>

</style>

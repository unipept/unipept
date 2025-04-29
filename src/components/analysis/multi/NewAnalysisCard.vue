<template>
    <div>
        <v-unipept-card>
            <v-card-title>
                <h2>Advanced analysis</h2>
            </v-card-title>
            <v-card-text>
                <p>
                    Open an existing project (<em>.unipept</em>) or start from scratch with an empty project and start analyzing
                    your own data.
                </p>

                <div class="d-flex justify-end">
                    <file-upload-button
                        class="mt-3 me-3 float-right"
                        variant="plain"
                        color="primary"
                        text="Open project"
                        prepend-icon="mdi-folder-open-outline"
                        accept=".unipept"
                        :multiple="false"
                        @upload="openUploadDialog"
                    />

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

        <v-dialog
            v-model="uploadDialogOpen"
            max-width="600"
            persistent
            @keydown.enter="() => projectName && openProject()"
        >
            <v-unipept-card>
                <v-card-title class="text-h6 font-weight-bold">
                    Upload project
                </v-card-title>

                <v-card-text class="pb-0">
                    <v-alert
                        v-if="projectExists(projectName)"
                        class="mb-4"
                        type="warning"
                    >
                        A project with the name <b>{{ projectName }}</b> already exists. You can either overwrite the
                        existing project or choose a different name.
                    </v-alert>

                    <v-text-field
                        v-model="projectName"
                        label="Project name"
                        variant="outlined"
                        color="primary"
                        placeholder="Enter a name for your project"
                        :rules="[
                            v => !!v || 'Project name is required'
                        ]"
                    />
                </v-card-text>

                <v-card-actions class="justify-end">
                    <v-btn variant="text" @click="cancel">Cancel</v-btn>
                    <v-btn
                        color="primary"
                        text="Upload project"
                        :disabled="!projectName"
                        @click="openProject"
                    />
                </v-card-actions>
            </v-unipept-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import FileUploadButton from "@/components/filesystem/FileUploadButton.vue";
import {ref} from "vue";

const props = defineProps<{
    projects: { name: string, lastAccessed: Date }[]
}>();

const emits = defineEmits<{
    (e: 'open', projectName: string, file: File): void
    (e: 'new', projectName: string): void
}>();

const newDialogOpen = ref(false);
const uploadDialogOpen = ref(false);

const projectName = ref('');
const openProjectFile = ref<File | null>(null);

const projectExists = (name: string) => {
    return props.projects.some(project => project.name === name);
};

const cancel = () => {
    newDialogOpen.value = false;
    uploadDialogOpen.value = false;
    projectName.value = '';
};

const openUploadDialog = (file: File) => {
    openProjectFile.value = file;
    projectName.value = file.name.slice(0, -8);
    uploadDialogOpen.value = true;
};

const openProject = () => {
    uploadDialogOpen.value = false;
    emits('open', projectName.value, openProjectFile.value!);
    openProjectFile.value = null;
    projectName.value = '';
};

const newProject = () => {
    newDialogOpen.value = false;
    emits('new', projectName.value);
    projectName.value = '';
};
</script>

<style scoped>

</style>

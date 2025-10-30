<template>
    <div>
        <v-unipept-card :disabled="disabled">
            <v-card-title>
                <h2>Start a new project</h2>
            </v-card-title>

            <v-card-text>
                <p>
                    Start from scratch with an empty project and analyse your own data.
                </p>

                <div>
                    <v-btn
                        class="mt-1 w-100 w-lg-auto float-lg-right"
                        style="width: 100%;"
                        variant="tonal"
                        color="primary"
                        text="Create new project"
                        prepend-icon="mdi-folder-plus-outline"
                        @click="newDialogOpen = true"
                    />
                </div>
            </v-card-text>
        </v-unipept-card>

        <new-project-dialog
            v-model="newDialogOpen"
            :project-exists="projectExists"
            @project:new="newProject"
        />
    </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import NewProjectDialog from "@/components/analysis/multi/NewProjectDialog.vue";

const { projects, disabled = false } = defineProps<{
    projects: { name: string, lastAccessed: Date }[],
    disabled?: boolean
}>();

const emits = defineEmits<{
    (e: 'project:new', projectName: string): void
}>();

const newDialogOpen = ref(false);

const projectExists = (name: string) => {
    return projects.some(project => project.name === name);
};

const newProject = (projectName: string) => {
    emits('project:new', projectName);
};
</script>

<style scoped>

</style>

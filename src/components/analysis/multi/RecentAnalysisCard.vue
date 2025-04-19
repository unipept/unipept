<template>
    <div>
        <v-card
            class="overflow-hidden"
            color="transparent"
            variant="flat"
            :height="height"
        >
            <h2 ref="header" class="mb-3 font-weight-light">
                Recent projects
            </h2>

            <v-card
                class="overflow-scroll"
                color="transparent"
                variant="flat"
                :height="height - headerHeight - 15"
            >
                <v-card
                    v-if="projects.length > 0"
                    v-for="project in visibleProjects"
                    :key="project"
                    class="project-card mb-1"
                    @click="openProject(project.name)"
                    variant="flat"
                    density="compact"
                >
                    <v-card-text class="d-flex align-center gap-2">
                        <v-icon size="20" class="me-3">mdi-folder-outline</v-icon>
                        <span>{{ project.name }}</span>
                        <v-spacer />

                        <v-icon
                            class="me-2"
                            color="error"
                            icon="mdi-delete"
                            @click.stop="deleteProject(project.name)"
                        />

                        <v-tooltip location="top">
                            <template #activator="{ props }">
                                <v-icon
                                    v-bind="props"
                                    icon="mdi-information"
                                />
                            </template>
                            <span>
                                Last opened on {{ project.lastAccessed.toLocaleDateString() }}
                            </span>
                        </v-tooltip>
                    </v-card-text>
                </v-card>

                <v-card
                    v-else
                    class="d-flex align-center justify-center"
                    color="transparent"
                    variant="flat"
                >
                    <v-card-text class="d-flex align-center">
                        <v-icon class="me-5" icon="mdi-folder-alert-outline" />
                        No projects found...
                    </v-card-text>
                </v-card>

                <v-btn v-if="hasMore" variant="text" color="primary" @click="showMore">
                    Show more
                </v-btn>
            </v-card>
        </v-card>

        <v-dialog
            v-model="deleteDialogOpen"
            max-width="600"
            persistent
        >
            <v-unipept-card>
                <v-card-title class="text-h6 font-weight-bold">
                    Delete project
                </v-card-title>

                <v-card-text class="pb-0">
                    <p>
                        Are you sure you want to delete the project <strong>{{ projectToDelete }}</strong>?
                        This action is <b>irreversible</b>.
                    </p>

                    <v-alert type="warning" class="mt-4">
                        Deleting this project will remove all associated data and results.
                    </v-alert>
                </v-card-text>

                <v-card-actions class="justify-end">
                    <v-btn variant="text" @click="cancel">Cancel</v-btn>
                    <v-btn
                        color="error"
                        text="Delete"
                        @click="confirmDeleteProject"
                    />
                </v-card-actions>
            </v-unipept-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, useTemplateRef, onMounted} from 'vue'
import {useElementBounding} from "@vueuse/core";

const props = defineProps<{
    height: number
    projects: { name: string, lastAccessed: Date }[]
}>();

const emits = defineEmits<{
    (e: 'open', project: string): void
    (e: 'delete', project: string): void
}>();

const header = useTemplateRef('header');
const { height: headerHeight } = useElementBounding(header);

const visibleCount = ref(5);
const deleteDialogOpen = ref(false);
const projectToDelete = ref<string>("");

const sortedProjects = computed(() => {
    return props.projects.sort((a, b) => {
        return b.lastAccessed.getTime() - a.lastAccessed.getTime();
    });
})
const visibleProjects = computed(() => sortedProjects.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < props.projects.length)

const showMore = () => {
    visibleCount.value = Math.min(visibleCount.value + 5, props.projects.length)
}

const openProject = (projectName: string) => {
    emits('open', projectName)
}

const cancel = () => {
    deleteDialogOpen.value = false;
    projectToDelete.value = "";
}

const deleteProject = (projectName: string) => {
    projectToDelete.value = projectName;
    deleteDialogOpen.value = true;
}

const confirmDeleteProject = () => {
    emits('delete', projectToDelete.value);
    deleteDialogOpen.value = false;
}
</script>

<style scoped>
.project-card {
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.project-card:hover {
    background-color: #E9F2FD; /* replace with your actual primary color */
    color: #4994EC;
}

.project-card:hover .v-icon {
    color: #4994EC;
}
</style>

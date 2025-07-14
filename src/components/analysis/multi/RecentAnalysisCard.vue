<template>
    <div>
        <v-unipept-card :height="height" :disabled="disabled">
            <v-card-title ref="header" class="d-flex">
                <h2 class="font-weight-light">
                    Load recent project
                </h2>

                <v-spacer />

                <v-tooltip text="Open an existing project (.unipept)">
                    <template v-slot:activator="{ props }">
                        <upload-analysis-button
                            v-bind="props"
                            :projects="projects"
                            :loading="loading"
                            @project:upload="uploadProject"
                        />
                    </template>
                </v-tooltip>
            </v-card-title>

            <div v-if="loading" class="d-flex flex-column justify-center align-center h-100">
                <v-progress-circular color="primary" indeterminate />
            </div>

            <div v-else-if="projects.length > 0">
                <v-virtual-scroll
                    :items="visibleProjects"
                    :height="height - headerHeight - footerHeight"
                >
                    <template #default="{ item, index }">
                        <v-card
                            class="project-card mb-1 ps-2"
                            @click="openProject(item.name)"
                            variant="flat"
                            density="compact"
                        >
                            <v-card-text class="d-flex align-center gap-2 py-3">
                                <v-icon size="20" class="mr-5">mdi-folder-outline</v-icon>
                                <div>
                                    <div>{{ item.name }}</div>
                                    <div class="text-subtitle-2">
                                        <span>Last opened on {{ item.lastAccessed.toLocaleDateString() }}</span>
                                        <span class="mx-2">•</span>
                                        <span>{{ formatNumber(item.totalPeptides) }} peptides</span>
                                    </div>
                                </div>

                                <v-spacer />

                                <v-btn
                                    variant="text"
                                    class="me-2"
                                    color="error"
                                    icon="mdi-delete"
                                    @click.stop="deleteProject(item.name)"
                                />
                            </v-card-text>
                        </v-card>
                    </template>
                </v-virtual-scroll>

                <div
                    ref="footer"
                    class="pb-2"
                >
                    <v-divider class="mx-5" />

                    <div class="d-flex align-center">
                        <div class="d-flex justify-center flex-grow-1">
                            <v-btn
                                v-if="projects.length > visibleProjects.length"
                                :disabled="!hasMore"
                                class="ms-5 mr-4"
                                variant="text"
                                color="primary"
                                @click="showMore"
                            >
                                Show more
                            </v-btn>
                        </div>

                        <v-tooltip text="Remove all projects">
                            <template v-slot:activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    class="me-5"
                                    variant="text"
                                    color="error"
                                    icon="mdi-delete-sweep"
                                    @click="deleteAllDialogOpen = true"
                                />
                            </template>
                        </v-tooltip>
                    </div>
                </div>
            </div>

            <v-card
                v-else
                class="d-flex align-center justify-center ms-5"
                variant="flat"
            >
                <v-card-text class="d-flex align-center">
                    <v-icon class="me-5" icon="mdi-folder-alert-outline" />
                    No projects found...
                </v-card-text>
            </v-card>
        </v-unipept-card>

        <v-dialog
            v-model="deleteDialogOpen"
            max-width="600"
            persistent
        >
            <v-unipept-card color="error" variant="tonal">
                <v-card-title class="text-h6 font-weight-bold">
                    Delete project
                </v-card-title>

                <v-card-text class="pb-0">
                    <p>
                        Are you sure you want to delete the project <strong>{{ projectToDelete }}</strong>?
                        This action is <b>irreversible</b>.
                    </p>
                </v-card-text>

                <v-card-actions class="justify-end">
                    <v-btn variant="text" @click="cancel" color="black">Cancel</v-btn>
                    <v-btn
                        color="error"
                        text="Yes, delete project"
                        @click="confirmDeleteProject"
                    />
                </v-card-actions>
            </v-unipept-card>
        </v-dialog>

        <v-dialog
            v-model="deleteAllDialogOpen"
            max-width="600"
            persistent
        >
            <v-unipept-card color="error" variant="tonal">
                <v-card-title class="text-h6 font-weight-bold">
                    Delete all recent projects?
                </v-card-title>

                <v-card-text class="pb-0">
                    <p>
                        Are you sure you want to delete all recent projects?
                        This action is <b>irreversible</b>.
                    </p>
                </v-card-text>

                <v-card-actions class="justify-end">
                    <v-btn variant="text" @click="cancel" color="black">Cancel</v-btn>
                    <v-btn
                        color="error"
                        text="Yes, delete all"
                        @click="confirmDeleteAllProjects"
                    />
                </v-card-actions>
            </v-unipept-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, useTemplateRef, onMounted} from 'vue'
import {useElementBounding} from "@vueuse/core";
import {useNumberFormatter} from "@/composables/useNumberFormatter";
import UploadAnalysisButton from "@/components/analysis/multi/UploadAnalysisButton.vue";
import {load} from "webfontloader";

const props = defineProps<{
    height: number,
    projects: { name: string, totalPeptides: number, lastAccessed: Date }[],
    loading: boolean,
    disabled: boolean
}>();

const emits = defineEmits<{
    (e: 'open', project: string): void
    (e: 'upload', projectName: string, file: File): void
    (e: 'delete', project: string): void
}>();

const { formatNumber } = useNumberFormatter();

const header = useTemplateRef('header');
const footer = useTemplateRef('footer');
const { height: headerHeight } = useElementBounding(header);
const { height: footerHeight } = useElementBounding(footer);

const visibleCount = ref(5);
const deleteDialogOpen = ref(false);
const deleteAllDialogOpen = ref(false);
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

const uploadProject = (projectName: string, file: File) => {
    emits('upload', projectName, file);
}

const cancel = () => {
    deleteAllDialogOpen.value = false;
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

const confirmDeleteAllProjects = () => {
    for (const project of sortedProjects.value) {
        emits('delete', project.name);
    }
    deleteAllDialogOpen.value = false;
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

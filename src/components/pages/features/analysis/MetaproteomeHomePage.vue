<template>
    <v-container>
        <v-snackbar
            v-model="showUpgradeError"
            color="error"
            :timeout="-1"
            multi-line
        >
            {{ upgradeError }}
            <template #actions>
                <v-btn variant="text" @click="showUpgradeError = false">Dismiss</v-btn>
            </template>
        </v-snackbar>

        <v-row>
            <v-col cols="12" md="6">
                <div ref="firstColumn">
                    <quick-analysis-card
                        :disabled="loadingProject || loadingDemoProject || loadingReprocessed"
                        @analyze="quickAnalyze"
                    />

                    <demo-analysis-card
                        class="mt-5"
                        :loading="loadingDemoProject"
                        :disabled="loadingProject || loadingSampleData || loadingDemoProject || loadingReprocessed"
                        :samples="sampleDataStore.samples"
                        @select="demoAnalyze"
                    />

                    <reprocessed-project-card
                        class="mt-5"
                        :accessions="reprocessedAccessions"
                        :loading="loadingAccessions"
                        :disabled="loadingProject || loadingDemoProject || loadingReprocessed || loadingAccessions"
                        @select="reprocessedAnalyze"
                    />
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <div ref="topCard">
                    <new-analysis-card
                        :projects="projects"
                        :disabled="loadingProject || loadingDemoProject || loadingReprocessed"
                        @project:new="advancedAnalyze"
                    />
                </div>

                <recent-analysis-card
                    class="mt-5"
                    :height="bottomCardHeight"
                    :projects="projects"
                    :disabled="loadingProject || loadingDemoProject || loadingReprocessed"
                    :loading="loadingProject"
                    :loading-message="importStatus"
                    @open="loadFromIndexedDB"
                    @upload="importProject"
                    @delete="deleteFromIndexedDB"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import QuickAnalysisCard from "@/components/analysis/multi/QuickAnalysisCard.vue";
import DemoAnalysisCard from "@/components/analysis/multi/DemoAnalysisCard.vue";
import {useRouter} from "vue-router";
import {computed, onMounted, Ref, ref, useTemplateRef} from "vue"
import useSampleDataStore from "@/store/SampleDataStore";
import {SampleData} from "@/composables/communication/unipept/useSampleData";
import {AnalysisConfig} from "@/store/AnalysisConfig";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";
import NewAnalysisCard from "@/components/analysis/multi/NewAnalysisCard.vue";
import RecentAnalysisCard from "@/components/analysis/multi/RecentAnalysisCard.vue";
import ReprocessedProjectCard from "@/components/analysis/multi/ReprocessedProjectCard.vue";
import useReprocessedProjects from "@/composables/communication/reprocessed/useReprocessedProjects";
import {useElementBounding} from "@vueuse/core";
import {storeToRefs} from "pinia";

const router = useRouter();

const store = useUnipeptAnalysisStore();
const { importStatus } = storeToRefs(store);
const {
    project,
    getProjects,
    loadNewProject,
    loadProjectFromStorage,
    loadProjectFromFile,
    loadProjectFromSample,
    loadProjectFromReprocessed,
    loadProjectFromPeptides,
    deleteProject
} = store;
const sampleDataStore = useSampleDataStore();
const { loadAccessions, loadProjectFiles } = useReprocessedProjects();

const firstColumn = useTemplateRef("firstColumn");
const { height: firstColumnHeight } = useElementBounding(firstColumn);
const topCard = useTemplateRef("topCard");
const { height: topCardHeight } = useElementBounding(topCard);
const bottomCardHeight = computed(() => firstColumnHeight.value - topCardHeight.value - 20);

const loadingSampleData: Ref<boolean> = ref(true);
const loadingProject: Ref<boolean> = ref(false);
const loadingDemoProject: Ref<boolean> = ref(false);
const loadingAccessions: Ref<boolean> = ref(true);
const loadingReprocessed: Ref<boolean> = ref(false);

const reprocessedAccessions = ref<string[]>([]);

const upgradeError: Ref<string | null> = ref(null);
const showUpgradeError = ref(false);

const projects = ref<{ name: string, totalPeptides: number, lastAccessed: Date, upgradeError?: string | null }[]>([]);

const quickAnalyze = async (rawPeptides: string, config: AnalysisConfig) => {
    await loadProjectFromPeptides(rawPeptides, config);
    await router.push({ name: "mpaSingle" });
    await startAnalysis();
}

const importProject = async (projectName: string, file: File) => {
    loadingProject.value = true;
    try {
        await loadProjectFromFile(projectName, file);
        await router.push({ name: "mpaSingle" });
        await startImport();
    } catch (e) {
        upgradeError.value = (e instanceof Error && e.message)
            ? e.message
            : "Failed to open this project. If it requires an upgrade, please check your internet connection and try again.";
        showUpgradeError.value = true;
    } finally {
        loadingProject.value = false;
    }
}

const loadFromIndexedDB = async (projectName: string) => {
    loadingProject.value = true;
    try {
        await loadProjectFromStorage(projectName);
        await router.push({ name: "mpaSingle" });
        await startImport();
    } catch (e) {
        upgradeError.value = (e instanceof Error && e.message)
            ? e.message
            : "Failed to open this project. If it requires an upgrade, please check your internet connection and try again.";
        showUpgradeError.value = true;
        projects.value = await getProjects();
    } finally {
        loadingProject.value = false;
    }
}

const deleteFromIndexedDB = async (projectName: string) => {
    await deleteProject(projectName);
    projects.value = await getProjects();
}

const advancedAnalyze = (projectName: string) => {
    loadNewProject(projectName);
    router.push({ name: "mpaSingle" });
}

const demoAnalyze = async (sample: SampleData) => {
    loadingDemoProject.value = true;
    await loadProjectFromSample(sample);
    await router.push({ name: "mpaSingle" });
    loadingDemoProject.value = true;
    await startAnalysis();
}

const reprocessedAnalyze = async (accession: string) => {
    loadingReprocessed.value = true;
    try {
        const files = await loadProjectFiles(accession);
        await loadProjectFromReprocessed(accession, files);
        await router.push({ name: "mpaSingle" });
        await startAnalysis();
    } catch (e) {
        upgradeError.value = "Failed to open this reprocessed project. Please check your internet connection and try again.";
        showUpgradeError.value = true;
    } finally {
        loadingReprocessed.value = false;
    }
}

const startAnalysis = async () => {
    for (const group of project.groups) {
        for (const analysis of group.analyses) {
            await analysis.analyse();
        }
    }
}

const startImport = async () => {
    for (const group of project.groups) {
        for (const analysis of group.analyses) {
            await analysis.importStore();
        }
    }
}

onMounted(async () => {
    projects.value = await getProjects();

    loadingSampleData.value = true;
    loadingAccessions.value = true;
    const [, accessions] = await Promise.all([
        sampleDataStore.loadSampleData(),
        loadAccessions().catch(() => [])
    ]);
    loadingSampleData.value = false;
    reprocessedAccessions.value = accessions;
    loadingAccessions.value = false;
})
</script>

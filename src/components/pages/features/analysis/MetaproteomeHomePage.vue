<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="6">
                <div ref="firstColumn">
                    <quick-analysis-card
                        :disabled="loadingProject || loadingDemoProject"
                        @analyze="quickAnalyze"
                    />

                    <demo-analysis-card
                        class="mt-5"
                        :loading="loadingDemoProject"
                        :disabled="loadingProject || loadingSampleData || loadingDemoProject"
                        :samples="sampleDataStore.samples"
                        @select="demoAnalyze"
                    />
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <div ref="topCard">
                    <new-analysis-card
                        :projects="projects"
                        :disabled="loadingProject || loadingDemoProject"
                        @project:new="advancedAnalyze"
                    />
                </div>

                <recent-analysis-card
                    class="mt-5"
                    :height="bottomCardHeight"
                    :projects="projects"
                    :disabled="loadingProject || loadingDemoProject"
                    :loading="loadingProject"
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
import {useElementBounding} from "@vueuse/core";

const router = useRouter();

const {
    project,

    getProjects,
    loadNewProject,
    loadProjectFromStorage,
    loadProjectFromFile,
    loadProjectFromSample,
    loadProjectFromPeptides,
    deleteProject
} = useUnipeptAnalysisStore();
const sampleDataStore = useSampleDataStore();

const firstColumn = useTemplateRef("firstColumn");
const { height: firstColumnHeight } = useElementBounding(firstColumn);
const topCard = useTemplateRef("topCard");
const { height: topCardHeight } = useElementBounding(topCard);
const bottomCardHeight = computed(() => firstColumnHeight.value - topCardHeight.value - 20);

const loadingSampleData: Ref<boolean> = ref(true);
const loadingProject: Ref<boolean> = ref(false);
const loadingDemoProject: Ref<boolean> = ref(false);

const projects = ref<{ name: string, totalPeptides: number, lastAccessed: Date }[]>([]);

const quickAnalyze = async (rawPeptides: string, config: AnalysisConfig) => {
    await loadProjectFromPeptides(rawPeptides, config);
    await router.push({ name: "mpaSingle" });
    await startAnalysis();
}

const importProject = async (projectName: string, file: File) => {
    loadingProject.value = true;
    await loadProjectFromFile(projectName, file)
    await router.push({ name: "mpaSingle" });
    await startImport();
    loadingProject.value = false;
}

const loadFromIndexedDB = async (projectName: string) => {
    loadingProject.value = true;
    await loadProjectFromStorage(projectName);
    await router.push({ name: "mpaSingle" });
    await startImport();
    loadingProject.value = false;
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
    await sampleDataStore.loadSampleData();
    loadingSampleData.value = false;
})
</script>

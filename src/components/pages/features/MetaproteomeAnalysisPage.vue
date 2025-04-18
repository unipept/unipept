<template>
    <v-container>
        <v-row>
            <v-col cols="6">
                <quick-analysis-card
                    @analyze="quickAnalyze"
                />

                <v-unipept-card class="mt-5">
                    <v-card-title>
                        <h2>Advanced analysis</h2>
                    </v-card-title>
                    <v-card-text>
                        <p>
                            Create a new project and analyze multiple samples or groups.
                        </p>
                        <v-btn
                            class="my-3 float-right"
                            variant="tonal"
                            text="Create new project"
                            @click="advancedAnalyze"
                        />
                    </v-card-text>
                </v-unipept-card>

                <project-import
                    class="mt-5"
                    @imported="importProject"
                />

                <v-btn
                    class="my-3 float-right"
                    variant="tonal"
                    text="load from indexeddb"
                    @click="loadFromIndexedDB"
                />
            </v-col>

            <v-col cols="6">
                <div
                    v-if="loadingSampleData"
                    class="d-flex flex-column align-center"
                >
                    <v-progress-circular
                        indeterminate
                        color="primary"
                    />
                    <div class="mt-4">
                        Loading sample data...
                    </div>
                </div>
                <demo-analysis-card
                    v-else
                    :samples="sampleDataStore.samples"
                    @select="demoAnalyze"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import QuickAnalysisCard from "@/components/analysis/multi/QuickAnalysisCard.vue";
import DemoAnalysisCard from "@/components/analysis/multi/DemoAnalysisCard.vue";
import {useRouter} from "vue-router";
import useProjectAnalysisStore, {
    ProjectAnalysisStoreImport,
    useProjectAnalysisStoreImport
} from "@/store/ProjectAnalysisStore";
import {onMounted, Ref, ref} from "vue"
import useSampleDataStore from "@/store/SampleDataStore";
import {SampleData} from "@/composables/communication/unipept/useSampleData";
import {AnalysisConfig} from "@/store/AnalysisConfig";
import ProjectImport from "@/components/project/import/ProjectImport.vue";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";

const router = useRouter();

const {
    project,
    loadNewProject,
    loadProjectFromStorage,
    loadProjectFromFile,
    loadProjectFromSample,
    loadProjectFromPeptides
} = useUnipeptAnalysisStore();
const sampleDataStore = useSampleDataStore();

const loadingSampleData: Ref<boolean> = ref(true);

const quickAnalyze = async (rawPeptides: string, config: AnalysisConfig) => {
    await loadProjectFromPeptides(rawPeptides, config);
    await router.push({ name: "mpaResults" });
    await startAnalysis();
}

const importProject = async (file: File) => {
    await loadProjectFromFile(file)
    await router.push({ name: "mpaResults" });
    await startImport();
}

const loadFromIndexedDB = async () => {
    await loadProjectFromStorage("project");
    await router.push({ name: "mpaResults" });
    await startImport();
}

const advancedAnalyze = () => {
    loadNewProject();
    router.push({ name: "mpaResults" });
}

const demoAnalyze = async (sample: SampleData) => {
    await loadProjectFromSample(sample);
    await router.push({ name: "mpaResults" });
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
    loadingSampleData.value = true;
    await sampleDataStore.loadSampleData();
    loadingSampleData.value = false;
})
</script>

<style scoped>

</style>

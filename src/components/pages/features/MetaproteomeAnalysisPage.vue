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
                <file-upload
                    v-model="jsonFile"
                    class="mb-4"
                />
                <v-btn
                    class="my-3 float-right"
                    variant="tonal"
                    text="Import project"
                    @click="importProject"
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
import useGroupAnalysisStore, {useGroupAnalysisStoreImport} from "@/store/new/GroupAnalysisStore";
import {onMounted, Ref, ref} from "vue"
import useSampleDataStore from "@/store/new/SampleDataStore";
import {SampleData} from "@/composables/communication/unipept/useSampleData";
import {AnalysisConfig} from "@/store/new/AnalysisConfig";
import FileUpload from "@/components/filesystem/FileUpload.vue";

const router = useRouter();
const groupStore = useGroupAnalysisStore();
const sampleDataStore = useSampleDataStore();

const loadingSampleData: Ref<boolean> = ref(true);

const jsonFile: Ref<File | null> = ref(null);

const quickAnalyze = async (rawPeptides: string, config: AnalysisConfig) => {
    groupStore.clear();
    const groupId = groupStore.addGroup("Quick analysis");
    groupStore.getGroup(groupId)?.addAnalysis("Sample", rawPeptides, config);
    await router.push({ name: "mpaResults" });
    await startAnalysis();
    //await groupStore.getGroup(groupId)?.getAnalysis(analysisId)?.importStore();
}

const importProject = async () => {
    groupStore.clear();

    const projectJson = await jsonFile.value.text();

    useGroupAnalysisStoreImport(JSON.parse(projectJson));

    await router.push({ name: "mpaResults" });

    for (const group of groupStore.groups) {
        for (const analysis of group.analyses) {
            await analysis.importStore();
        }
    }
}

const advancedAnalyze = () => {
    groupStore.clear();
    router.push({ name: "mpaResults" });
}

const demoAnalyze = async (sample: SampleData) => {
    groupStore.clear();
    const groupId = groupStore.addGroup(sample.environment);
    for (const dataset of sample.datasets) {
        groupStore.getGroup(groupId)?.addAnalysis(dataset.name, dataset.data.join('\n'), {
            equate: true,
            filter: true,
            missed: true,
            database: "UniProtKB"
        });
    }
    await router.push({ name: "mpaResults" });
    await startAnalysis();
}

const startAnalysis = async () => {
    for (const group of groupStore.groups) {
        for (const analysis of group.analyses) {
            await analysis.analyse();
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

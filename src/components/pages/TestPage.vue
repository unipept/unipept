<template>
    <v-container>
        <v-row>
            <v-col cols="6">
                <quick-analysis-card
                    @analyze="quickAnalyze"
                />
                <v-card
                    class="mt-5"
                    elevation="2"
                >
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
                </v-card>
            </v-col>

            <v-col cols="6">
                <div
                    v-if="loadingSampleData"
                    class="d-flex flex-column align-center"
                >
                    <v-progress-circular indeterminate color="primary" />
                    <div class="mt-4">Loading sample data...</div>
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
import QuickAnalysisCard from "@/components/new/analysis/QuickAnalysisCard.vue";
import DemoAnalysisCard from "@/components/new/analysis/DemoAnalysisCard.vue";
import {AnalysisConfig} from "@/store/new/SingleAnalysisStore";
import {useRouter} from "vue-router";
import useGroupAnalysisStore from "@/store/new/GroupAnalysisStore";
import {onMounted, Ref, ref} from "vue"
import useSampleDataStore from "@/store/new/SampleDataStore";
import {SampleData} from "@/composables/new/communication/unipept/useSampleData";

const router = useRouter();
const groupStore = useGroupAnalysisStore();
const sampleDataStore = useSampleDataStore();

const loadingSampleData: Ref<boolean> = ref(true);

const quickAnalyze = async (rawPeptides: string, config: AnalysisConfig) => {
    groupStore.clear();
    const groupId = groupStore.addGroup("Quick analysis");
    groupStore.getGroup(groupId)?.addAnalysis("Sample", rawPeptides, config);
    await router.push({name: "testResults"});
    await startAnalysis();
}

const advancedAnalyze = () => {
    groupStore.clear();
    router.push({ name: "testResults" });
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
    await router.push({ name: "testResults" });
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

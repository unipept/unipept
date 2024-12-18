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
                            class="mt-3"
                            color="grey-lighten-3"
                            text="Create new project"
                            @click="advancedAnalyze"
                        />
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="6">
                <demo-analysis-card
                    :samples="samples"
                    @select="demoAnalyze"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import QuickAnalysisCard from "@/components/new/analysis/QuickAnalysisCard.vue";
import DemoAnalysisCard from "@/components/new/analysis/DemoAnalysisCard.vue";
import useSampleData from "@/composables/new/communication/unipept/useSampleData";
import {onMounted} from "vue";
import {AnalysisConfig} from "@/store/new/SingleAnalysisStore";
import {useRouter} from "vue-router";
import useGroupAnalysisStore from "@/store/new/GroupAnalysisStore";

const router = useRouter();
const { samples, process } = useSampleData();
const groupStore = useGroupAnalysisStore();

const quickAnalyze = async (rawPeptides: string, config: AnalysisConfig) => {
    groupStore.clear();
    const groupId = groupStore.addGroup("Quick analysis");
    groupStore.getGroup(groupId)?.addAnalysis("Sample", rawPeptides, config);
    await router.push({ name: "testResults" });
    await startAnalysis();
}

const advancedAnalyze = () => {
    groupStore.clear();
    router.push({ name: "testResults" });
}

const demoAnalyze = async (sample) => {
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

onMounted(() => {
    process();
});
</script>

<style scoped>

</style>

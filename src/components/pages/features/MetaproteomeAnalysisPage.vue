<template>
    <v-container>
        <v-row>
            <v-col cols="6">
                <div ref="firstColumn">
                    <quick-analysis-card
                        @analyze="quickAnalyze"
                    />

                    <demo-analysis-card
                        class="mt-5"
                        :samples="sampleDataStore.samples"
                        @select="demoAnalyze"
                    />
                </div>
            </v-col>

            <v-col cols="6">
                <new-analysis-card
                    ref="topCard"
                    @click="advancedAnalyze"
                />

                <recent-analysis-card
                    class="mt-5"
                    :height="bottomCardHeight"
                />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import QuickAnalysisCard from "@/components/analysis/multi/QuickAnalysisCard.vue";
import DemoAnalysisCard from "@/components/analysis/multi/DemoAnalysisCard.vue";
import {useRouter} from "vue-router";
import {computed, onMounted, Ref, ref, useTemplateRef, watch} from "vue"
import useSampleDataStore from "@/store/SampleDataStore";
import {SampleData} from "@/composables/communication/unipept/useSampleData";
import {AnalysisConfig} from "@/store/AnalysisConfig";
import ProjectImport from "@/components/project/import/ProjectImport.vue";
import useUnipeptAnalysisStore from "@/store/UnipeptAnalysisStore";
import NewAnalysisCard from "@/components/analysis/multi/NewAnalysisCard.vue";
import RecentAnalysisCard from "@/components/analysis/multi/RecentAnalysisCard.vue";
import {useElementBounding} from "@vueuse/core";

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

const firstColumn = useTemplateRef("firstColumn");
const { height: firstColumnHeight } = useElementBounding(firstColumn);
const topCard = useTemplateRef("topCard");
const { height: topCardHeight } = useElementBounding(topCard);
const bottomCardHeight = computed(() => firstColumnHeight.value - topCardHeight.value - 20);

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

watch(bottomCardHeight, () => {
    console.log(bottomCardHeight.value);
    console.log(firstColumnHeight.value);
    console.log(topCardHeight.value);
})

onMounted(async () => {
    loadingSampleData.value = true;
    await sampleDataStore.loadSampleData();
    loadingSampleData.value = false;
})
</script>

<style scoped>

</style>

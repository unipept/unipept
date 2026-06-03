<template>
    <functional-terms-analysis-results
        :store="analysisStore"
        title="EC Functional Analysis"
        rank="EC"
        filename="unipept_ec_functional_analysis"
        term-header="EC term"
        name-header="EC name"
        :resolver="resolveName"
    />
</template>

<script setup lang="ts">
import {computed} from "vue";
import useOntologyStore from "@/store/OntologyStore";
import FunctionalTermsAnalysisResults from "@/components/results/functional/FunctionalTermsAnalysisResults.vue";

const props = defineProps<{
    store: any;
}>();

const { getEcDefinition } = useOntologyStore();

const analysisStore = computed(() => ({
    status: props.store.status,
    termsToConfidence: props.store.ecTermsToConfidence,
    analysisStarted: props.store.analysisStarted,
    analysisInitializationFinished: props.store.analysisInitializationFinished,
    currentProgress: props.store.currentProgress,
    etaSeconds: props.store.etaSeconds,
    analysisError: props.store.analysisError
}));

const resolveName = (term: string) => getEcDefinition(term)?.name || "";
</script>

<style scoped>
</style>

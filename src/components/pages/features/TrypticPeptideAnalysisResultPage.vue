<template>
    <single-peptide-analysis-wrapper
        class="mb-5"
        :peptide="route.params.sequence as string"
        :equate-il="route.query.equate === 'true'"
    />
</template>

<script setup lang="ts">
import SinglePeptideAnalysisWrapper from "@/components/wrappers/SinglePeptideAnalysisWrapper.vue";
import { useRoute } from "vue-router";

const route = useRoute();
</script>

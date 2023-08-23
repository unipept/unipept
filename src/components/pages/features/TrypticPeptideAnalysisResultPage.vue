<template>
    <single-peptide-analysis-wrapper
        class="mb-5"
        :peptide="$route.params.sequence"
        :equate-il="equate($route.query.equate)"
    />
</template>

<script setup lang="ts">
import SinglePeptideAnalysisWrapper from "@/components/wrappers/SinglePeptideAnalysisWrapper.vue";

const equate = (equate: string | (string | null)[]): boolean => { return !!equate };
</script>

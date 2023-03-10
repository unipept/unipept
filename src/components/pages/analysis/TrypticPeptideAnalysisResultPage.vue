<template>
    <SinglePeptideAnalysisyWrapper
        class="mb-5"
        :peptide="$route.params.sequence"
        :equateIl="equate($route.query.equate)"
    />
</template>

<script setup lang="ts">
import SinglePeptideAnalysisyWrapper from "../../wrappers/SinglePeptideAnalysisWrapper.vue";

const equate = (equate: string | (string | null)[]): boolean => { return equate ? true : false };
</script>

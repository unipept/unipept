<template>
    <v-container>
        <v-col
            cols="12"
            lg="8"
            offset-lg="2"
        >
            <single-peptide-analysis-search-card />
        </v-col>
    </v-container>
</template>

<script setup lang="ts">
import SinglePeptideAnalysisSearchCard from '@/components/analysis/single/SinglePeptideAnalysisSearchCard.vue';
</script>

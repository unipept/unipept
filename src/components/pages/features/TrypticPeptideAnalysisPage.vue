<template>
    <v-container>
        <v-col
            cols="12"
            lg="8"
            offset-lg="2"
        >
            <tryptic-peptide-analysis-search-card/>
        </v-col>
    </v-container>
</template>

<script setup lang="ts">
import TrypticPeptideAnalysisSearchCard from '@/components/cards/analysis/single/TrypticPeptideAnalysisSearchCard.vue';
</script>

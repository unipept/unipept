<template>
    <v-unipept-card>
        <v-card-title>
            <span class="text-h4">Comparative analysis of {{
                    selectedAnalyses.length
                }} {{ selectedAnalyses.length === 1 ? 'sample' : 'samples' }}
            </span>
        </v-card-title>
        <v-card-text>
            <h2 class="pb-2">
                Analysis summary
            </h2>

            <h2 class="pb-2">
                Peptide matches
            </h2>
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";

const { selectedAnalyses } = defineProps<{
    selectedAnalyses: SingleAnalysisStore[]
}>();
</script>

<style scoped>

</style>
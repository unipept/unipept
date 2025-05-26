<template>
    <v-unipept-card>
        <v-card-title>
            <span class="text-h4">Comparative analysis of {{
                    selectedAnalyses.length
                }} {{ selectedAnalyses.length === 1 ? 'sample' : 'samples' }}
            </span>
        </v-card-title>
        <v-card-text>

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
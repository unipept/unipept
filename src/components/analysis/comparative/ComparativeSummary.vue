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

            <div>
                <!-- Show here whether all selected samples have been analysed using the same settings. -->
            </div>

            <v-container fluid class="pa-0 ma-0">
                <v-row>
                    <v-col :cols="6">
                        <h2 class="pb-2">
                            Most common shared species
                        </h2>
                        <top-shared-species-table :selected-analyses="selectedAnalyses" />
                    </v-col>
                    <v-col :cols="6">
                        <h2 class="pb-2">
                            Sample specific unique species
                        </h2>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {onMounted, ref, Ref} from "vue";
import TopSharedSpeciesTable from "@/components/analysis/comparative/TopSharedSpeciesTable.vue";

const { selectedAnalyses } = defineProps<{
    selectedAnalyses: SingleAnalysisStore[]
}>();
</script>

<style scoped>

</style>
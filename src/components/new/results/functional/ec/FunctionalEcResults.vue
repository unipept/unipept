<template>
    <div v-if="!filtering">
        <v-row>
            <v-col>
            <span>
                This panel shows the Gene Ontology annotations that were matched to your peptides.
                <b>{{ trust.annotatedItems }}</b> proteins <b>({{ displayPercentage(trust.annotatedItems / trust.totalItems) }})</b>
                have at least one EC number assigned to them. Click on a row in a table to see a taxonomy tree that
                highlights occurrences.
            </span>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <ec-results-table
                    :items="items"
                    :analysis="analysis"
                    :show-percentage="showPercentage"
                />
            </v-col>
        </v-row>
    </div>
    <div v-else>
        <filter-progress text="The EC numbers are currently being filtered." />
    </div>
</template>

<script setup lang="ts">
import EcResultsTable from "@/components/new/results/functional/ec/EcResultsTable.vue";
import FilterFunctionalResults from "@/components/new/results/functional/FilterFunctionalResults.vue";
import {computed, ref} from "vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import usePercentage from "@/composables/new/usePercentage";
import useOntologyStore from "@/store/new/OntologyStore";
import {AnalysisStatus} from "@/components/pages/TestPage.vue";
import FilterProgress from "@/components/new/results/functional/FilterProgress.vue";

const { getEcDefinition } = useOntologyStore();
const { displayPercentage } = usePercentage();

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore;
    showPercentage: boolean;
}>();

const filtering = computed(() => analysis.filteringStatus !== AnalysisStatus.Finished);
const trust = computed(() => analysis.ecTrust);
const items = computed(() => Array.from(analysis.ecTable.entries()).map(([key, value]) => {
    return {
        code: key,
        name: getEcDefinition(key)?.name ?? "Unknown",
        namespace: getEcDefinition(key)?.namespace ?? "Unknown",
        count: value,
        totalCount: analysis.ecTrust.totalItems,
    }
}));
</script>

<style scoped>

</style>

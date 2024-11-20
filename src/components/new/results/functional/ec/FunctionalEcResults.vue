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
        <v-row>
            <v-col cols="12">
                <v-card
                    class="pa-0 ma-0"
                    height="400"
                    variant="flat"
                >
                    <treeview
                        v-if="root"
                        :ncbi-root="root"
                    />
                </v-card>
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
import {computed, onMounted, ref, watch} from "vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import usePercentage from "@/composables/new/usePercentage";
import useOntologyStore from "@/store/new/OntologyStore";
import {AnalysisStatus} from "@/components/pages/TestPage.vue";
import FilterProgress from "@/components/new/results/functional/FilterProgress.vue";
import useEcTreeProcessor from "@/composables/new/processing/functional/useEcTreeProcessor";
import Treeview from "@/components/new/results/taxonomic/Treeview.vue";

const { getEcDefinition } = useOntologyStore();
const { displayPercentage } = usePercentage();
const { root, process } = useEcTreeProcessor();

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

watch(() => analysis, () => {
    process(analysis.ecTable);
});

onMounted(() => {
    process(analysis.ecTable);
});
</script>

<style scoped>

</style>

<template>
    <div v-if="!filtering">
        <v-row class="mb-1">
            <v-col>
            <span>
                This panel shows the InterPro annotations that were matched to your peptides.
                <b>{{ trust.annotatedItems }}</b> proteins <b>({{ displayPercentage(trust.annotatedItems / trust.totalItems) }})</b>
                have at least one InterPro entry assigned to them. Click on a row in a table to see a taxonomy tree that
                highlights occurrences.
            </span>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <v-select
                    v-model="selectedNamespace"
                    :items="namespaces"
                    label="InterPro category"
                    density="compact"
                    variant="outlined"
                    hide-details
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <ipr-results-table
                    :items="filteredItems"
                    :analysis="analysis"
                    :show-percentage="showPercentage"
                />
            </v-col>
        </v-row>
    </div>

    <div v-else>
        <filter-progress text="The InterPro entries are currently being filtered." />
    </div>
</template>

<script setup lang="ts">
import IprResultsTable from "@/components/new/results/functional/ipr/IprResultsTable.vue";
import FilterFunctionalResults from "@/components/new/results/functional/FilterFunctionalResults.vue";
import {computed, ref} from "vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import usePercentage from "@/composables/new/usePercentage";
import useOntologyStore from "@/store/new/OntologyStore";
import FilterProgress from "@/components/new/results/functional/FilterProgress.vue";
import {AnalysisStatus} from "@/store/new/SingleAnalysisStore";

const { getIprDefinition } = useOntologyStore();
const { displayPercentage } = usePercentage();

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore;
    showPercentage: boolean;
}>();

const selectedNamespace = ref<string>("all");

const filtering = computed(() => analysis.filteringStatus !== AnalysisStatus.Finished);
const trust = computed(() => analysis.iprTrust);
const items = computed(() => Array.from(analysis.iprTable.entries()).map(([key, value]) => {
    return {
        code: key,
        name: getIprDefinition(key)?.name ?? "Unknown",
        namespace: getIprDefinition(key)?.namespace ?? "Unknown",
        count: value,
        totalCount: analysis.iprTrust.totalItems,
    }
}));
const filteredItems = computed(() => {
    if (selectedNamespace.value === "all") {
        return items.value;
    }

    return items.value.filter(x => x.namespace === selectedNamespace.value);
});
</script>

<script lang="ts">
const namespaces = [
    "all",
    "active site",
    "binding site",
    "conserved site",
    "domain",
    "family",
    "homologous superfamily",
    "ptm",
    "repeat",
    "unknown"
];
</script>

<style scoped>

</style>

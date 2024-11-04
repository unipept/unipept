<template>
    <v-row class="mb-1">
        <v-col>
            <span>
                This panel shows the InterPro annotations that were matched to your peptides.
                <b>{{ trust.annotatedItems }}</b> proteins <b>({{ displayPercentage(trust.annotatedItems / trust.totalItems) }})</b>
                have at least one InterPro entry assigned to them. Click on a row in a table to see a taxonomy tree that
                highlights occurrences.
            </span>
        </v-col>
        <v-col class="flex-grow-0 align-content-center">
            <v-btn
                icon="mdi-cog-outline"
                size="small"
                variant="text"
                @click="filterModalOpen = true"
            />
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
                :items="items"
                :show-percentage="showPercentage"
            />
        </v-col>
    </v-row>

    <filter-functional-results
        v-model="filterModalOpen"
        @confirm="updateFilter"
    />
</template>

<script setup lang="ts">
import IprResultsTable from "@/components/new/results/functional/ipr/IprResultsTable.vue";
import FilterFunctionalResults from "@/components/new/results/functional/FilterFunctionalResults.vue";
import {computed, ref} from "vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import usePercentage from "@/composables/new/usePercentage";
import useOntologyStore from "@/store/new/OntologyStore";

const { getIprDefinition } = useOntologyStore();
const { displayPercentage } = usePercentage();

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore;
    showPercentage: boolean;
}>();

const filterModalOpen = ref<boolean>(false);
const filter = ref<number>(5);
const selectedNamespace = ref<string>("all");

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

const updateFilter = (value: number) => {
    filter.value = value;
}
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

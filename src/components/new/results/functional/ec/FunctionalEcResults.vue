<template>
    <v-row class="mb-1">
        <v-col>
            <span>
                This panel shows the Gene Ontology annotations that were matched to your peptides.
                <b>{{ trust.annotatedItems }}</b> proteins <b>({{ displayPercentage(trust.annotatedItems / trust.totalItems) }})</b>
                have at least one EC number assigned to them. Click on a row in a table to see a taxonomy tree that
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
            <ec-results-table
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
import EcResultsTable from "@/components/new/results/functional/ec/EcResultsTable.vue";
import FilterFunctionalResults from "@/components/new/results/functional/FilterFunctionalResults.vue";
import {computed, ref} from "vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import usePercentage from "@/composables/new/usePercentage";
import useOntologyStore from "@/store/new/OntologyStore";

const { getEcDefinition } = useOntologyStore();
const { displayPercentage } = usePercentage();

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore;
    showPercentage: boolean;
}>();

const filterModalOpen = ref<boolean>(false);
const filter = ref<number>(5);

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

const updateFilter = (value: number) => {
    filter.value = value;
}
</script>

<style scoped>

</style>

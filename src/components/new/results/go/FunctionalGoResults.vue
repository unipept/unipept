<template>
    <v-row class="mb-1">
        <v-col>
            <span>
                This panel shows the Gene Ontology annotations that were matched to your peptides.
                <b>{{ trust.annotatedItems }}</b> proteins <b>({{ displayPercentage(trust.annotatedItems / trust.totalItems) }})</b>
                have at least one GO term assigned to them. Click on a row in a table to see a taxonomy tree that highlights occurrences.
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

    <h2 class="py-2">
        Biological Process
    </h2>
    <v-row>
        <v-col cols="9">
            <go-results-table
                :items="biologicalProcessItems"
                :show-percentage="showPercentage"
            />
        </v-col>
        <v-col cols="3">
            <quick-go-card
                :items="biologicalProcessItems"
                :namespace="GoNamespace.BiologicalProcess"
                :n="3"
            />
        </v-col>
    </v-row>

    <h2 class="py-2">
        Cellular Component
    </h2>
    <v-row>
        <v-col cols="9">
            <go-results-table
                :items="cellularComponentItems"
                :show-percentage="showPercentage"
            />
        </v-col>
        <v-col cols="3">
            <quick-go-card
                :items="cellularComponentItems"
                :namespace="GoNamespace.CellularComponent"
                :n="3"
            />
        </v-col>
    </v-row>

    <h2 class="py-2">
        Molecular Function
    </h2>
    <v-row>
        <v-col cols="9">
            <go-results-table
                :items="molecularFunctionItems"
                :show-percentage="showPercentage"
            />
        </v-col>
        <v-col cols="3">
            <quick-go-card
                :items="molecularFunctionItems"
                :namespace="GoNamespace.MolecularFunction"
                :n="3"
            />
        </v-col>
    </v-row>

    <filter-functional-results
        v-model="filterModalOpen"
        @confirm="updateFilter"
    />
</template>

<script setup lang="ts">
import GoResultsTable from "./GoResultsTable.vue";
import FilterFunctionalResults from "@/components/new/results/FilterFunctionalResults.vue";
import {computed, ref} from "vue";
import QuickGoCard from "@/components/new/results/go/QuickGoCard.vue";
import {GoNamespace} from "unipept-web-components";
import usePercentage from "@/composables/new/usePercentage";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";

const { displayPercentage } = usePercentage();

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore;
    showPercentage: boolean;
}>();

const filterModalOpen = ref<boolean>(false);
const filter = ref<number>(5);

const trust = computed(() => analysis.goTrust);
const biologicalProcessItems = computed(() => Array.from(analysis.goTable.entries()).filter((x, i) => i % 3 == 0).map(([key, value]) => {
    return {
        code: key,
        name: "Unknown",
        count: value,
        totalCount: analysis.goTrust.totalItems,
    }
}));
const cellularComponentItems = computed(() => Array.from(analysis.goTable.entries()).filter((x, i) => i % 3 == 1).map(([key, value]) => {
    return {
        code: key,
        name: "Unknown",
        count: value,
        totalCount: analysis.goTrust.totalItems,
    }
}));
const molecularFunctionItems = computed(() => Array.from(analysis.goTable.entries()).filter((x, i) => i % 3 == 2).map(([key, value]) => {
    return {
        code: key,
        name: "Unknown",
        count: value,
        totalCount: analysis.goTrust.totalItems,
    }
}));

const updateFilter = (value: number) => {
    filter.value = value;
}
</script>

<style scoped>

</style>

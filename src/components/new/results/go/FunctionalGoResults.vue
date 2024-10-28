<template>
    <v-row class="mb-1">
        <v-col>
            <span>
                This panel shows the Gene Ontology annotations that were matched to your peptides. 2013 proteins (98%) have at least one GO
                term assigned to them. Click on a row in a table to see a taxonomy tree that highlights occurrences.
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
            <go-results-table :items="biologicalProcessItems" :show-percentage="showPercentage" />
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
            <go-results-table :items="cellularComponentItems" :show-percentage="showPercentage" />
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
            <go-results-table :items="molecularFunctionItems" :show-percentage="showPercentage" />
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
import {ref} from "vue";
import QuickGoCard from "@/components/new/results/go/QuickGoCard.vue";
import {GoNamespace} from "unipept-web-components";

const props = defineProps<{
    showPercentage: boolean;
}>();

const filterModalOpen = ref<boolean>(false);
const filter = ref<number>(5);

const biologicalProcessItems = [{
    code: "GO:0000001",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000002",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000003",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000004",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000005",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000006",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000007",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000008",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000009",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000010",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000011",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000012",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000013",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000014",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000015",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000016",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000017",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000018",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000019",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}];

const cellularComponentItems = [{
    code: "GO:0000008",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000009",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000010",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000011",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000012",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000013",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000014",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000015",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000016",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000017",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000018",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000019",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}];

const molecularFunctionItems = [{
    code: "GO:0000004",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000005",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000006",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000007",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000008",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000009",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000010",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000011",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000012",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000013",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000014",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000015",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000016",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000017",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000018",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}, {
    code: "GO:0000019",
    name: "mitochondrion inheritance",
    count: 1,
    totalCount: 2
}];

const updateFilter = (value: number) => {
    filter.value = value;
}
</script>

<style scoped>

</style>

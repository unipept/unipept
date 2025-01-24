<template>
    <div>
        <v-select
            v-model="selectedDataSource"
            :items="dataSources"
            class="mt-3"
            label="Feature type"
            density="compact"
            variant="outlined"
            hide-details
        />

        <data-source-select-table
            v-model="selectedItems"
            :items="items"
            :categories="categories"
            class="mt-3"
        />
    </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import DataSourceSelectTable from "./DataSourceSelectTable.vue";
import useOntologyStore from "@/store/new/OntologyStore";
import {DataSourceTableItem} from "@/components/results/taxonomic/heatmap/DataSourceSelectTable.vue";
import {GoNamespace} from "@/composables/new/ontology/useGoOntology";
import {EcNamespace} from "@/composables/new/ontology/useEcOntology";
import {InterproNamespace} from "@/composables/new/ontology/useInterproOntology";
import {NcbiRank} from "@/logic/new/ontology/taxonomic/Ncbi";

const {
    getNcbiDefinition,
    getGoDefinition,
    getEcDefinition,
    getIprDefinition
} = useOntologyStore();

const selectedItems = defineModel<DataSourceTableItem[]>();

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore
}>();

const selectedDataSource = ref<DataSource>(DataSource.NCBI);

const categories = computed(() => {
    switch (selectedDataSource.value) {
        case DataSource.NCBI: return [ "All", ...Object.values(NcbiRank) ];
        case DataSource.GO: return [ "All", ...Object.values(GoNamespace) ];
        case DataSource.EC: return [ "All", ...Object.values(EcNamespace) ];
        case DataSource.INTERPRO: return [ "All", ...Object.values(InterproNamespace) ];
        default: return [];
    }
});

const items = computed(() => {
    switch (selectedDataSource.value) {
        case DataSource.NCBI: return getItems(analysis.lcaTable, analysis.lcaToPeptides, getNcbiDefinition);
        case DataSource.GO: return getItems(analysis.goTable, analysis.goToPeptides, getGoDefinition);
        case DataSource.EC: return getItems(analysis.ecTable, analysis.ecToPeptides, getEcDefinition);
        case DataSource.INTERPRO: return getItems(analysis.iprTable, analysis.iprToPeptides, getIprDefinition);
        default: return [];
    }
});

watch(() => analysis, () => {
    selectedDataSource.value = DataSource.NCBI;
});

watch(selectedDataSource, () => {
    selectedItems.value = [];
});
</script>

<script lang="ts">
import CountTable from "@/logic/new/CountTable";

enum DataSource {
    NCBI = "NCBI taxonomy",
    GO = "Gene Ontology",
    EC = "Enzyme Commission",
    INTERPRO = "Interpro"
}

const dataSources = Object.values(DataSource);

const getItems = (countTable: CountTable, peptideMapping: Map<any, string>, ontology: any) => {
    const items = [...countTable.entries()].map(([id, count]) => {
        const definition = ontology(id);
        return {
            id: id,
            name: definition?.name || "Unknown",
            category: definition?.rank || definition?.namespace || "Unknown",
            count: count,
            peptides: peptideMapping.get(id)
        };
    });

    items.sort((a, b) => b.count - a.count);

    return items;
}
</script>

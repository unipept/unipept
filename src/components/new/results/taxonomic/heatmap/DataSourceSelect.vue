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
import {DataSourceTableItem} from "@/components/new/results/taxonomic/heatmap/DataSourceSelectTable.vue";

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

// TODO: these enums do not belong here: Move to composables

export enum NcbiRank {
    Superkingdom = "superkingdom",
    Kingdom = "kingdom",
    Subkingdom = "subkingdom",
    Superphylum = "superphylum",
    Phylum = "phylum",
    Subphylum = "subphylum",
    Superclass = "superclass",
    Class = "class",
    Subclass = "subclass",
    Superorder = "superorder",
    Order = "order",
    Suborder = "suborder",
    Infraorder = "infraorder",
    Superfamily = "superfamily",
    Family = "family",
    Subfamily = "subfamily",
    Tribe = "tribe",
    Subtribe = "subtribe",
    Genus = "genus",
    Subgenus = "subgenus",
    SpeciesGroup = "species group",
    SpeciesSubgroup = "species subgroup",
    Species = "species",
    Subspecies = "subspecies",
    Strain = "strain",
    Varietas = "varietas",
    Forma = "forma"
}

export enum GoNamespace {
    BiologicalProcess = "biological process",
    CellularComponent = "cellular component",
    MolecularFunction = "molecular function"
}

export enum EcNamespace {
    // EC 1.x.x.x class
    Oxidoreductases = "oxidoreductases",
    // EC 2.x.x.x class
    Transferases = "transferases",
    // EC 3.x.x.x class
    Hydrolases = "hydrolases",
    // EC 4.x.x.x class
    Lyases = "lyases",
    // EC 5.x.x.x class
    Isomerases = "isomerases",
    // EC 6.x.x.x class
    Ligases = "ligases",
    // EC 7.x.x.x class
    Translocases = "translocases",
}

export enum InterproNamespace {
    ActiveSite = "active site",
    BindingSite = "binding site",
    ConservedSite = "conserved site",
    Domain = "domain",
    Family = "family",
    HomologousSuperfamily = "homologous superfamily",
    PTM = "ptm",
    Repeat = "repeat",
    Unknown = "unknown"
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

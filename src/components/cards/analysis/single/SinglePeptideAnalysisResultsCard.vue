<template>
    <v-card>
        <v-tabs
            v-model="currentTab"
            slider-color="secondary"
            bg-color="primary"
            dark
        >
            <v-tab value="matched-proteins">
                Matched proteins
            </v-tab>
            <v-tab value="lineage-tree">
                Lineage tree
            </v-tab>
            <v-tab value="lineage-table">
                Lineage table
            </v-tab>
            <v-tab value="go-terms">
                GO terms
            </v-tab>
            <v-tab value="ec-numbers">
                EC numbers
            </v-tab>
            <v-tab value="interpro">
                Interpro
            </v-tab>
        </v-tabs>

        <v-window v-model="currentTab">
            <v-window-item value="matched-proteins">
                <matched-proteins-table :assay="assay" />
            </v-window-item>
            <v-window-item value="lineage-tree">
                <v-card-text>
                    This interactive tree bundles the complete taxonomic lineages of all UniProt entries whose protein sequence contains the tryptic peptide.
                </v-card-text>
                <treeview :ncbi-root="assay.ncbiTree!"/>
            </v-window-item>
            <v-window-item value="lineage-table">
                <lineage-table :assay="assay" />
            </v-window-item>
            <v-window-item value="go-terms">
                <!-- @vue-ignore -->
<!--                <go-summary-card-->
<!--                    :analysis-in-progress="assay.analysisInProgress"-->
<!--                    :go-processor="assay.goProteinCountTableProcessor"-->
<!--                    :go-ontology="assay.goOntology"-->
<!--                />-->
            </v-window-item>
            <v-window-item value="ec-numbers">
                <!-- @vue-ignore -->
<!--                <ec-summary-card-->
<!--                    :analysis-in-progress="assay.analysisInProgress"-->
<!--                    :ec-processor="assay.ecProteinCountTableProcessor"-->
<!--                    :ec-ontology="assay.ecOntology"-->
<!--                    :ec-tree="assay.ecTree"-->
<!--                />-->
            </v-window-item>
            <v-window-item value="interpro">
                <!-- @vue-ignore -->
<!--                <interpro-summary-card-->
<!--                    :analysis-in-progress="assay.analysisInProgress"-->
<!--                    :interpro-processor="assay.interproProteinCountTableProcessor"-->
<!--                    :interpro-ontology="assay.interproOntology"-->
<!--                />-->
            </v-window-item>
        </v-window>
    </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import MatchedProteinsTable from "@/components/tables/MatchedProteinsTable.vue";
import {PeptideAnalysisStore} from "@/store/new/PeptideAnalysisStore";
import LineageTable from "@/components/tables/LineageTable.vue";
import Treeview from "@/components/new/results/taxonomic/Treeview.vue";


export interface Props {
    assay: PeptideAnalysisStore
    tab?: string
}

const props = withDefaults(defineProps<Props>(), {
    tab: "matched-proteins"
});

const emits = defineEmits(["tabUpdate"]);

const currentTab = ref<string>(props.tab);

watch(() => props.tab, (newTab) => {
    currentTab.value = newTab;
});

watch(currentTab, (newTab) => {
    emits("tabUpdate", newTab);
});
</script>
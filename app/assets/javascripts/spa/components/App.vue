<template>
    <v-app style="background: transparent;">
        <v-row v-if="!analysis">
            <v-col :cols="2"></v-col>
            <v-col :cols="8">
                <search-peptide-card v-on:search="onSearch"></search-peptide-card>
            </v-col>
            <v-col :cols="2"></v-col>
        </v-row>
        <v-row v-else>
            <v-col :cols="12">
                <single-peptide-summary :peptide="sequence" :equateIl="equateIl"></single-peptide-summary>
                <single-peptide-analysis-card :peptide="sequence" :equateIl="equateIl"></single-peptide-analysis-card>
            </v-col>
        </v-row>
    </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import NetworkConfiguration from "unipept-web-components/src/business/communication/NetworkConfiguration";
import SinglePeptideAnalysisCard from "unipept-web-components/src/components/analysis/single/SinglePeptideAnalysisCard.vue";
import SinglePeptideSummary from "unipept-web-components/src/components/analysis/single/SinglePeptideSummary.vue";
import SearchPeptideCard from "./search/SearchPeptideCard.vue";
import { Peptide } from "unipept-web-components/src/business/ontology/raw/Peptide";

@Component({
    components: {
        SearchPeptideCard,
        SinglePeptideSummary,
        SinglePeptideAnalysisCard
    }
})
export default class App extends Vue {
    private analysis: boolean = false;
    private sequence: Peptide = "";
    private equateIl: boolean = true;

    private created() {
        NetworkConfiguration.BASE_URL = "";
    }

    private onSearch(sequence: Peptide, equateIl: boolean) {
        this.sequence = sequence;
        this.equateIl = equateIl;
        this.analysis = true;
    }
}
</script>

<style>
    .v-application--wrap {
        /* Fix too high application content */
        min-height: 0 !important;
    }
</style>

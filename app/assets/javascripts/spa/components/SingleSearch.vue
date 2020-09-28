<template>
    <v-app style="background: transparent;">
        <v-row>
            <v-col :cols="2"></v-col>
            <v-col :cols="8">
                <search-peptide-card v-on:search="onSearch"></search-peptide-card>
            </v-col>
            <v-col :cols="2"></v-col>
        </v-row>
    </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import SearchPeptideCard from "./search/SearchPeptideCard.vue";
import { Peptide } from "unipept-web-components";

@Component({
    components: {
        SearchPeptideCard
    }
})
export default class SingleSearch extends Vue {
    private sequence: Peptide = "";
    private equateIl: boolean = true;

    private mounted() {
        console.log("SINGLE SEARCH APP...");
    }

    private onSearch(sequence: Peptide, equateIl: boolean) {
        this.sequence = sequence;
        this.equateIl = equateIl;

        window.location.replace(`/sequences/${this.sequence}${this.equateIl ? '/equateIl' : ''}`);
    }
}
</script>

<style>
    .v-application--wrap {
        /* Fix too high application content */
        min-height: 0 !important;
    }
</style>

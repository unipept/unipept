<template>
    <card class="select-datasets-card">
        <card-header>
            <card-title>Metaproteomics Analysis</card-title>
        </card-header>
        <card-body>
            <label>Select datasets</label>
            <list class="select-datasets-list" placeholder="Please select one or more datasets from the right hand panel to continue the analysis..">
                <div class="list-item--two-lines" v-for="dataset of selectedDatasets" v-bind:key="dataset.id">
                <span class="list-item-primary-content">
                    {{ dataset.getName() }}
                    <span class="list-item-date">
                        {{ dataset.getDateFormatted() }}
                    </span>
                    <span class="list-item-body">
                        {{ dataset.getAmountOfPeptides() }} peptides
                    </span>
                </span>
                    <span class="list-item-secondary-action">
                    <span class="glyphicon glyphicon-trash" @click="deselectDataset(dataset)"></span>
                </span>
                </div>
            </list>
            <search-settings-form
                    :equate-il="equateIl"
                    v-on:equate-il-change="equateIl = $event"
                    :filter-duplicates="filterDuplicates"
                    v-on:filter-duplicates-change="filterDuplicates = $event"
                    :missing-cleavage="missingCleavage"
                    v-on:missing-cleavage="missingCleavage = $event"
                    class="selected-dataset-settings"
            ></search-settings-form>            
            <div class="search-buttons-centered">
                <v-btn @click="search()" color="primary">
                    <v-icon left>
                        mdi-magnify
                    </v-icon>
                    Search
                </v-btn>
                <v-btn @click="reset()">
                    <v-icon left>
                        mdi-restore
                    </v-icon>
                    Start over
                </v-btn>
            </div>
        </card-body>
    </card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Card from "../../components/card/card.vue";
    import Checkbox from "../../components/input/checkbox.vue";
    import List from "../../components/list/list.vue";
    import PeptideContainer from "../PeptideContainer";
    import SearchSettingsForm from "./search-settings-form.vue";
    import CardTitle from "../../components/card/card-title.vue";
    import CardHeader from "../../components/card/card-header.vue";
    import CardBody from "../../components/card/card-body.vue";

    @Component({
        components: {CardBody, CardHeader, CardTitle, SearchSettingsForm, Checkbox, Card, List}
    })
    export default class SelectDatasetsCard extends Vue {
        selectedDatasets = this.$store.getters.selectedDatasets;

        equateIl: boolean = true;
        filterDuplicates: boolean = true;
        missingCleavage: boolean = false;

        created() {
            this.equateIl = this.$store.getters.searchSettings.il;
            this.filterDuplicates = this.$store.getters.searchSettings.dupes;
            this.missingCleavage = this.$store.getters.searchSettings.missed;
        }

        deselectDataset(dataset: PeptideContainer) {
            this.$store.dispatch('deselectDataset', dataset);
        }

        search(): void {
            this.$store.dispatch('setSearchSettings', {il: this.equateIl, dupes: this.filterDuplicates, missed: this.missingCleavage});
            this.$store.dispatch('setAnalysis', true);
        }

        reset(): void {
            this.equateIl = true;
            this.filterDuplicates = true;
            this.missingCleavage = false;
            this.$store.dispatch('clearSelectedDatasets');
        }
    }
</script>

<style>
    .v-input__control {
        margin-bottom: -30px;
        margin-top: -10px;
    }

    .v-input__control label {
        margin-bottom: 0px;
    }

    .selected-dataset-settings {
        margin-bottom: 5px;
    }
</style>

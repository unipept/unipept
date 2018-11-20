<template>
    <card title="Metaproteomics Analysis">
        <label>Select datasets</label>
        <list placeholder="Please select one or more datasets from the right hand panel to continue the analysis..">
            <div class="list-item--two-lines" v-for="dataset of selectedDatasets">
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
        <label>Search settings</label>
        <checkbox v-model="equateIl" label="Equate I and L" placeholder="Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries."></checkbox>
        <checkbox v-model="filterDuplicates" label="Filter duplicate peptides" placeholder="Remove duplicate peptides from the input before searching."></checkbox>
        <checkbox v-model="missingCleavage" label="Advanced missing cleavage handling" placeholder="Recombine subpeptides of miscleavages. Enabling this has a serious performance impact!"></checkbox>
        <div class="search-buttons-centered">
            <simple-button label="Search" glyphicon="search" type="primary"></simple-button>
            <simple-button label="Start Over" glyphicon="repeat spin"></simple-button>
        </div>
    </card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Card from "../../components/card/card";
    import Checkbox from "../../components/input/checkbox";
    import List from "../../components/list/list";
    import PeptideContainer from "../peptideContainer";
    import DatasetManager from "../datasetManager"
    import NewPeptideContainer from "../NewPeptideContainer";
    import SimpleButton from "../../components/button/simple-button";

    @Component({
        components: {SimpleButton, Checkbox, Card, List}
    })
    export default class SelectDatasetsCard extends Vue {
        selectedDatasets = this.$store.getters.selectedDatasets;

        equateIl: boolean = true;
        filterDuplicates: boolean = true;
        missingCleavage: boolean = false;

        deselectDataset(dataset: NewPeptideContainer) {
            this.$store.dispatch('deselectDataset', dataset);
        }
    }
</script>

<style scoped>

</style>

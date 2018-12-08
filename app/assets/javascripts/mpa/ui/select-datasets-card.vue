<template>
    <card class="select-datasets-card">
        <card-header>
            <card-title>Metaproteomics Analysis</card-title>
        </card-header>
        <card-body>
            <label>Select datasets</label>
            <list class="select-datasets-list" placeholder="Please select one or more datasets from the right hand panel to continue the analysis..">
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
            <search-settings-form></search-settings-form>
            <div class="search-buttons-centered">
                <simple-button label="Search" glyphicon="search" type="primary" @click="search()"></simple-button>
                <simple-button label="Start Over" glyphicon="repeat spin" @click="reset()"></simple-button>
            </div>
        </card-body>
    </card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Card from "../../components/card/card";
    import Checkbox from "../../components/input/checkbox";
    import List from "../../components/list/list";
    import PeptideContainer from "../PeptideContainer";
    import SimpleButton from "../../components/button/simple-button";
    import SearchSettingsForm from "./search-settings-form.vue";
    import SearchSettings from "../SearchSettings";
    import CardTitle from "../../components/card/card-title.vue";
    import CardHeader from "../../components/card/card-header.vue";
    import CardBody from "../../components/card/card-body.vue";

    @Component({
        components: {CardBody, CardHeader, CardTitle, SearchSettingsForm, SimpleButton, Checkbox, Card, List}
    })
    export default class SelectDatasetsCard extends Vue {
        selectedDatasets = this.$store.getters.selectedDatasets;
        deselectDataset(dataset: PeptideContainer) {
            this.$store.dispatch('deselectDataset', dataset);
        }

        search(): void {
            this.$store.dispatch('setAnalysis', true);
        }

        reset(): void {
            this.$store.dispatch('clearSelectedDatasets');
        }
    }
</script>

<style scoped>

</style>

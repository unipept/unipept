<template>
    <card-nav class="load-datasets-card">
        <tab label="Create" :active="true">
            <dataset-form v-on:peptide-change="createPeptides = $event" :peptides="createPeptides" v-on:name-change="createName = $event" :name="createName" v-on:save-change="createSave = $event" :save="createSave" :loading="pendingStore"></dataset-form>
            <div class="search-buttons-centered">
                <simple-button @click="storeCreateDataset()" label="Add to selected datasets" glyphicon="plus" :disabled="pendingStore"></simple-button>
            </div>
        </tab>
        <tab label="Sample data">
        </tab>
        <tab label="Pride">
            <h3>Load data from the PRIDE archive</h3>
            <p>You can easily load data from the <a href="http://www.ebi.ac.uk/pride/" target="_blank">PRIDE</a> data repository. Simply enter an assay id (e.g. 8500) in the field below and click the 'Load PRIDE Dataset' button. The corresponding dataset will then be fetched using the PRIDE API and loaded into the search form on the left.</p>
            <validated-textfield v-model="prideAssay" label="Assay id" placeholder="e.g. 8500" :disabled="prideLoading || pendingStore"></validated-textfield>
            <div class="search-buttons-centered">
                <simple-button v-if="!prideLoading" glyphicon="cloud-download" label="Fetch PRIDE dataset" @click="fetchPrideAssay()"></simple-button>
                <determinate-striped-progress-bar v-if="prideLoading" :progress="prideProgress"></determinate-striped-progress-bar>
            </div>
            <dataset-form v-on:peptide-change="pridePeptides = $event" :peptides="pridePeptides" v-on:name-change="prideName = $event" :name="prideName" v-on:save-change="prideSave = $event" :save="prideSave" :loading="prideLoading || pendingStore"></dataset-form>
            <p>{{ prideLoading }}</p>
            <div class="search-buttons-centered">
                <simple-button @click="storePrideDataset()" label="Add to selected datasets" glyphicon="plus" :disabled="prideLoading || pendingStore"></simple-button>
            </div>
        </tab>
        <tab label="Local data">
            <list placeholder="There are currently no datasets present in your browser's local storage.">
                <div class="list-item--two-lines" v-for="dataset of storedDatasets" style="cursor: pointer;" @click="selectDataset(dataset)">
                    <span class="list-item-primary-action">
                        <span class="glyphicon glyphicon-plus select-dataset-button"></span>
                    </span>
                    <span class="list-item-primary-content">
                        {{ dataset.getName() }}
                        <span class="list-item-date">
                            {{ dataset.getDateFormatted() }}
                        </span>
                        <span class="list-item-body">
                            {{ dataset.getAmountOfPeptides() }} peptides
                        </span>
                    </span>
                </div>
            </list>
        </tab>
    </card-nav>
</template>

<script lang="ts">
    import Vue from "vue";

    import Component from "vue-class-component";
    import DatasetForm from "./dataset-form";
    import Tab from "../../components/card/tab"
    import CardNav from "../../components/card/card-nav";
    import SimpleButton from "../../components/button/simple-button";
    import List from "../../components/list/list";
    import NewPeptideContainer from "../NewPeptideContainer";
    import ValidatedTextfield from "../../components/input/validated-textfield";
    import NewDatasetManager from "../NewDatasetManager";
    import {StorageType} from "../StorageType";
    import DeterminateStripedProgressBar from "../../components/progress/determinate-striped-progress-bar";

    @Component({
        components: {DeterminateStripedProgressBar, ValidatedTextfield, SimpleButton, CardNav, DatasetForm, Tab, List}
    })
    export default class LoadDatasetsCard extends Vue {
        storedDatasets = this.$store.getters.storedDatasets;
        prideAssay: string = "";

        createPeptides: string = "";
        createName: string = "";
        createSave: boolean = true;

        pridePeptides: string = "";
        prideName: string = "";
        prideSave: boolean = true;
        prideLoading: boolean = false;
        prideProgress: number = 0;

        pendingStore: boolean = false;

        selectDataset(dataset: NewPeptideContainer): void {
            this.$store.dispatch('selectDataset', dataset);
        }

        fetchPrideAssay(): void {
            this.prideLoading = true;
            let datasetManager: NewDatasetManager = new NewDatasetManager();
            let prideNumber: number = parseInt(this.prideAssay);

            this.prideName = 'PRIDE assay ' + prideNumber.toString();

            datasetManager.loadPrideDataset(prideNumber, (progress) => this.prideProgress = progress)
                .then((peptides) => {
                    this.pridePeptides = peptides.join("\n");
                    this.prideLoading = false;
                });
        }

        storePrideDataset() {
            this.storeDataset(this.pridePeptides, this.prideName, this.prideSave);
        }

        storeCreateDataset() {
            console.log(this.createPeptides);
            console.log(this.createName);
            this.storeDataset(this.createPeptides, this.createName, this.createSave);
        }

        private storeDataset(peptides: string, name: string, save: boolean): void {
            this.pendingStore = true;
            let peptideContainer: NewPeptideContainer = new NewPeptideContainer();
            peptideContainer.setPeptides(peptides.split('\n'));
            peptideContainer.setDate(new Date());
            peptideContainer.setType(save ? StorageType.LocalStorage : StorageType.SessionStorage);
            peptideContainer.setName(name);
            peptideContainer.store().then(
                () => {
                    this.$store.dispatch('selectDataset', peptideContainer);
                    this.$store.dispatch('addStoredDataset', peptideContainer);
                    this.pendingStore = false;
                }
            );
        }
    };
</script>

<style scoped>
</style>

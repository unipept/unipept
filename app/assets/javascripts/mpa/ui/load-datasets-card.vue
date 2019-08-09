<template>
    <v-card>
        <v-tabs color="primary" dark>
            <v-tab>
                Create
            </v-tab>
            <v-tab-item>
                <v-card flat>
                    <v-card-text>
                        <dataset-form ref="createdDatasetForm" v-on:peptide-change="createPeptides = $event" :peptides="createPeptides" v-on:name-change="createName = $event" :name="createName" v-on:save-change="createSave = $event" :save="createSave" :loading="pendingStore"></dataset-form>
                        <div class="search-buttons-centered">
                            <v-btn :disabled="pendingStore" @click="storeCreatedDataset()">
                                <v-icon left>mdi-plus</v-icon>
                                Add to selected datasets
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-tab-item>
            <v-tab>
                Sample data
            </v-tab>
            <v-tab-item>
                <v-card flat>
                    <v-card-text>
                        <p v-for="dataset of sampleDatasets" v-bind:key="dataset.id">
                            <b>Environment:</b> {{ dataset.environment }}
                            <br>
                            <b>Reference:</b>
                            <small>
                                {{ dataset.reference }}
                                <a target="_blank" title="Article website" :href="dataset.url">
                                    <span class="glyphicon glyphicon-link"></span>
                                </a>
                                <a target="_blank" title="Project website" :href="dataset.projectWebsite">
                                    <span class="glyphicon glyphicon-share-alt"></span>
                                </a>
                            </small>
                            <br>
                            <span class="form-inline">
                                <select class="form-control dataset" v-model="selectedSampleDataset[dataset.id]">
                                    <option v-for="data of dataset.datasets" v-bind:value="data" v-bind:key="data.id">{{ data.name }}</option>
                                </select>
                                <v-btn @click="storeSampleDataset(dataset.id)">
                                    Load dataset
                                </v-btn>
                            </span>
                        </p>
                    </v-card-text>
                </v-card>
            </v-tab-item>
            <v-tab>
                Pride
            </v-tab>
            <v-tab-item>
                <v-card flat>
                    <v-card-text>
                        <h3>Load data from the PRIDE archive</h3>
                        <p>You can easily load data from the <a href="http://www.ebi.ac.uk/pride/" target="_blank">PRIDE</a> data repository. Simply enter an assay id (e.g. 8500) in the field below and click the 'Load PRIDE Dataset' button. The corresponding dataset will then be fetched using the PRIDE API and loaded into the search form on the left.</p>
                        <v-form ref="prideAssayForm">
                            <v-text-field label="Assay id" placeholder="e.g. 8500" :disabled="prideLoading || pendingStore" v-model="prideAssay" :rules="[value => !!value || 'Please enter a valid PRIDE assay number']" clearable></v-text-field>
                        </v-form>
                        <div class="search-buttons-centered">
                            <v-btn v-if="!prideLoading" @click="fetchPrideAssay()">
                                <v-icon left>mdi-cloud-download</v-icon>
                                Fetch PRIDE dataset
                            </v-btn>
                            <v-progress-linear v-if="prideLoading" v-model="prideProgress"></v-progress-linear>
                        </div>
                        <dataset-form ref="prideDatasetForm" v-on:peptide-change="pridePeptides = $event" :peptides="pridePeptides" v-on:name-change="prideName = $event" :name="prideName" v-on:save-change="prideSave = $event" :save="prideSave" :loading="prideLoading || pendingStore"></dataset-form>
                        <div class="search-buttons-centered">
                            <v-btn :disabled="prideLoading || pendingStore" @click="storePrideDataset()">
                                <v-icon left>mdi-plus</v-icon>
                                Add to selected datasets
                            </v-btn>
                        </div>
                        <snackbar :timeout="0" ref="prideSnackbar">Loading dataset... <div class="spinner"></div></snackbar>
                    </v-card-text>
                </v-card>
            </v-tab-item>
            <v-tab>
                Local data
            </v-tab>
            <v-tab-item>
                <v-card flat>
                    <span v-if="storedDatasets.length === 0">There are currently no datasets present in your browser's local storage.</span>
                    <v-list two-line>
                        <template v-for="dataset of storedDatasets">
                            <v-list-tile :key="dataset.id" ripple @click="selectDataset(dataset)">
                                <v-list-tile-action>
                                    <v-icon>mdi-plus</v-icon>
                                </v-list-tile-action>
                                <v-list-tile-content>
                                    <v-list-tile-title>
                                        {{ dataset.getName() }}
                                    </v-list-tile-title>
                                    <v-list-tile-sub-title>
                                        {{ dataset.getAmountOfPeptides() }} peptides
                                    </v-list-tile-sub-title>
                                </v-list-tile-content>

                                <v-list-tile-action>
                                    <v-list-tile-action-text>
                                        {{ dataset.getDateFormatted() }}
                                    </v-list-tile-action-text>
                                    <v-icon @click="deleteDataset(dataset)" v-on:click.stop>mdi-close</v-icon>
                                </v-list-tile-action>
                            </v-list-tile>
                        </template>
                    </v-list>
                </v-card>
            </v-tab-item>
        </v-tabs>
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";

    import Component from "vue-class-component";
    import DatasetForm from "./dataset-form.vue";
    import Tab from "../../components/card/tab.vue"
    import CardNav from "../../components/card/card-nav.vue";
    import List from "../../components/list/list.vue";
    import PeptideContainer from "../PeptideContainer";
    import DatasetManager from "../DatasetManager";
    import {StorageType} from "../StorageType";
    import Tabs from "../../components/card/tabs.vue";
    import Snackbar from "../../components/snackbar/snackbar.vue";
    import axios from "axios"
    import SampleDataset from "../SampleDataset";

    @Component({
        components: {
            Snackbar,
            Tabs,
            CardNav, DatasetForm, Tab}
    })
    export default class LoadDatasetsCard extends Vue {
        $refs!: {
            createdDatasetForm: DatasetForm,
            prideDatasetForm: DatasetForm,
            prideSnackbar: Snackbar,
            // TODO update typings once Vuetify typings available
            prideAssayForm: any
        }

        private storedDatasets = this.$store.getters.storedDatasets;
        private sampleDatasets: SampleDataset[] = [];
        private prideAssay: string = "";

        private createPeptides: string = "";
        private createName: string = "";
        private createSave: boolean = true;

        private pridePeptides: string = "";
        private prideName: string = "";
        private prideSave: boolean = true;
        private prideLoading: boolean = false;
        private prideProgress: number = 0;

        private pendingStore: boolean = false;

        private selectedSampleDataset = {};

        mounted() {
            axios.post("/datasets/sampledata")
                .then(result => {
                    for (let item of result.data.sample_data) {
                        let itemDatasets = item.datasets;
                        itemDatasets = itemDatasets.sort((a, b) => {
                            return a.order < b.order;
                        });
                        this.sampleDatasets.push(new SampleDataset(
                            item.id,
                            item.environment,
                            item.project_website,
                            item.reference,
                            item.url,
                            itemDatasets
                        ));
                        this.selectedSampleDataset[item.id] = itemDatasets[0];
                    }
                });
        }

        storeSampleDataset(datasetId: string) {
            if (this.selectedSampleDataset[datasetId]) {
                this.storeDataset(this.selectedSampleDataset[datasetId].data.join("\n"), this.selectedSampleDataset[datasetId].name, true);
            }
        }

        selectDataset(dataset: PeptideContainer): void {
            this.$store.dispatch('selectDataset', dataset);
        }

        fetchPrideAssay(): void {
            if (this.$refs.prideAssayForm.validate()) {
                this.prideLoading = true;
                let datasetManager: DatasetManager = new DatasetManager();
                let prideNumber: number = parseInt(this.prideAssay);

                this.prideName = 'PRIDE assay ' + prideNumber.toString();

                this.$refs.prideSnackbar.show();
                datasetManager
                    .loadPrideDataset(prideNumber, (progress) => this.prideProgress = progress * 100)
                    .then((peptides) => {
                        this.pridePeptides = peptides.join("\n");
                        this.prideLoading = false;
                        this.$refs.prideSnackbar.destroy();
                    });
            }
        }

        storePrideDataset() {
            //@ts-ignore
            if (this.$refs.prideDatasetForm.isValid()) {
                this.storeDataset(this.pridePeptides, this.prideName, this.prideSave);
            }
        }

        storeCreatedDataset() {
            // @ts-ignore
            if (this.$refs.createdDatasetForm.isValid()) {
                this.storeDataset(this.createPeptides, this.createName, this.createSave);
            }
        }

        private storeDataset(peptides: string, name: string, save: boolean): void {
            this.pendingStore = true;
            let peptideContainer: PeptideContainer = new PeptideContainer();
            peptideContainer.setPeptides(peptides.split('\n'));
            peptideContainer.setDate(new Date());
            peptideContainer.setType(save ? StorageType.LocalStorage : StorageType.SessionStorage);
            peptideContainer.setName(name);
            peptideContainer.store().then(
                () => {
                    this.$store.dispatch('selectDataset', peptideContainer);
                    if (save) {
                        this.$store.dispatch('addStoredDataset', peptideContainer);
                    }
                    this.pendingStore = false;
                }
            );
        }
    };
</script>

<style>
    .peptide-amount-wrapper {
        display: flex !important;
        flex-direction: row;
        justify-content: space-between;
    }
</style>

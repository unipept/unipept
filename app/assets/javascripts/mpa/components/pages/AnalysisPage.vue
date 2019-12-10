<template>
    <div>
        <v-row class="equal-height-row">
            <v-col>
                <switch-datasets-card :selected-datasets="this.$store.getters.selectedDatasets" :active-dataset="this.$store.getters.activeDataset" style="min-height: 100%;"></switch-datasets-card>
            </v-col>
            <v-col>
                <experiment-summary-card style="min-height: 100%;" v-if="!datasetSelectionInProgress" :disabled="$store.getters.selectedDatasets.some(el => el.progress !== 1)"></experiment-summary-card>
                <load-datasets-card :selected-datasets="this.$store.getters.selectedDatasets" :stored-datasets="this.$store.getters.storedDatasets" style="min-height: 100%;" v-else id="analysis-add-dataset-card"></load-datasets-card>
            </v-col>
        </v-row>
        <single-dataset-visualizations-card id="visualizations-card" :dataRepository="this.$store.getters.activeDataset ? this.$store.getters.activeDataset.dataRepository : null" :analysisInProgress="$store.getters.datasetsInProgress > 0"></single-dataset-visualizations-card>
        <functional-summary-card style="margin-top: 12px;" :dataRepository="this.$store.getters.activeDataset ? this.$store.getters.activeDataset.dataRepository : null" :analysisInProgress="$store.getters.datasetsInProgress > 0"></functional-summary-card>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import FunctionalSummaryCard from "unipept-web-components/src/components/analysis/functional/FunctionalSummaryCard.vue";
import SingleDatasetVisualizationsCard from "unipept-web-components/src/components/visualizations/SingleDatasetVisualizationsCard.vue";
import LoadDatasetsCard from "unipept-web-components/src/components/dataset/LoadDatasetsCard.vue";
import SwitchDatasetsCard from "./../dataset/SwitchDatasetsCard.vue";
import ExperimentSummaryCard from "unipept-web-components/src/components/analysis/statistics/ExperimentSummaryCard.vue";
import { EventBus } from "unipept-web-components/src/components/EventBus";
import PeptideContainer from "unipept-web-components/src/logic/data-management/PeptideContainer";
import Assay from "unipept-web-components/src/logic/data-management/assay/Assay";


@Component({
    components: {
        FunctionalSummaryCard, 
        SingleDatasetVisualizationsCard, 
        LoadDatasetsCard, 
        SwitchDatasetsCard, 
        ExperimentSummaryCard
    },
    computed: {
        selectedDatasets: {
            get() {
                return this.$store.getters.selectedDatasets;
            }
        }
    }
})
export default class AnalysisPage extends Vue {
    private datasetSelectionInProgress: boolean = false;
    private eventListeners: {type: string, listener: any}[] = [];

    created() {
        for (let dataset of this.$store.getters.selectedDatasets) {
            this.$store.dispatch('processDataset', dataset);
        }
    }

    private mounted() {
        this.initializeEventListeners();
    }

    private beforeDestroy() {
        this.destroyEventListeners();
    }

    private initializeEventListeners() {
        this.eventListeners.push({
            type: "select-dataset",
            listener: (dataset: PeptideContainer) => {
                if (this.$store.getters.selectedDatasets.indexOf(dataset) === -1) {
                    this.$store.dispatch('selectDataset', dataset);
                    this.$store.dispatch('processDataset', dataset);
                }
            }
        });

        this.eventListeners.push({
            type: "toggle-dataset-selection",
            listener: (value: boolean) => {
                this.datasetSelectionInProgress = value;
            }
        });

        this.eventListeners.push({
            type: "activate-dataset",
            listener: (dataset: PeptideContainer) => {
                this.$store.dispatch("setActiveDataset", dataset);
            }
        });

        this.eventListeners.push({
            type: "deselect-dataset",
            listener: (dataset: Assay) => {
                this.$store.dispatch("deselectDataset", dataset);
            }
        });

        this.eventListeners.push({
            type: "store-dataset",
            listener: (dataset: PeptideContainer) => {
                this.$store.dispatch("addStoredDataset", dataset);
            }
        });

        for (let listener of this.eventListeners) {
            EventBus.$on(listener.type, listener.listener);
        }
    }

    private destroyEventListeners() {
        for (let listener of this.eventListeners) {
            EventBus.$off(listener.type, listener.listener);
        }
    }
}
</script>

<style>
    #analysis-add-dataset-card::before {
        content:"\A";
        border-top: 24px solid transparent;
        border-bottom: 24px solid transparent;
        border-right: 24px solid #2196F3;
        z-index: 5;
        position: absolute;
        left: -24px;
    }

    #analysis-add-dataset-card {
        border-top-left-radius: 0px;
    }
</style>

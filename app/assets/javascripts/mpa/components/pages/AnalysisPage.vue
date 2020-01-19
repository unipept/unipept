<template>
    <div>
        <v-row class="equal-height-row">
            <v-col>
                <switch-datasets-card 
                    :selected-assays="this.$store.getters.getSelectedAssays" 
                    :active-assay="this.$store.getters.getActiveAssay"
                    v-on:deselect-assay="onDeselectAssay"
                    v-on:activate-assay="onActivateAssay"
                    v-on:assay-selection-in-progress="onAssaySelection"
                    style="min-height: 100%;">
                </switch-datasets-card>
            </v-col>
            <v-col>
                <experiment-summary-card 
                    v-if="!datasetSelectionInProgress"
                    style="min-height: 100%;"
                    :disabled="$store.getters.getSelectedAssays.some(el => el.progress !== 1)" 
                    :activeAssay="$store.getters.getActiveAssay"
                    v-on:update-search-settings="onUpdateSearchSettings">
                </experiment-summary-card>
                <load-datasets-card 
                    v-else
                    :selected-assays="this.$store.getters.getSelectedAssays" 
                    :stored-assays="this.$store.getters.getStoredAssays"
                    v-on:create-assay="onCreateAssay"
                    style="min-height: 100%;" 
                    id="analysis-add-dataset-card">
                </load-datasets-card>
            </v-col>
        </v-row>
        <single-dataset-visualizations-card id="visualizations-card" :dataRepository="this.$store.getters.getActiveAssay ? this.$store.getters.getActiveAssay.dataRepository : null" :analysisInProgress="$store.getters.datasetsInProgress > 0"></single-dataset-visualizations-card>
        <functional-summary-card style="margin-top: 12px;" :dataRepository="this.$store.getters.getActiveAssay ? this.$store.getters.getActiveAssay.dataRepository : null" :analysisInProgress="$store.getters.datasetsInProgress > 0"></functional-summary-card>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import FunctionalSummaryCard from "unipept-web-components/src/components/analysis/functional/FunctionalSummaryCard.vue";
import SingleDatasetVisualizationsCard from "unipept-web-components/src/components/visualizations/SingleDatasetVisualizationsCard.vue";
import LoadDatasetsCard from "./../dataset/LoadDatasetsCard.vue";
import SwitchDatasetsCard from "./../dataset/SwitchDatasetsCard.vue";
import ExperimentSummaryCard from "unipept-web-components/src/components/analysis/statistics/ExperimentSummaryCard.vue";
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
        for (let assay of this.$store.getters.getSelectedAssays) {
            this.$store.dispatch('processAssay', assay);
        }
    }

    private onDeselectAssay(assay: Assay) {
        this.$store.dispatch("deselectAssay", assay);
    }

    private onActivateAssay(assay: Assay) {
        this.$store.dispatch("setActiveAssay", assay);
    }

    private onCreateAssay(assay: Assay) {
        this.$store.dispatch("processAssay", assay);
    }

    private onAssaySelection(status: boolean) {
        this.datasetSelectionInProgress = status;
    }

    private onUpdateSearchSettings(settings: MPAConfig) {
        // We need to reprocess all assays with the new search settings.
        this.$store.dispatch("updateSearchSettings", settings);
        
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

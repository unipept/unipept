<template>
    <div>
        <div class="row equal-height-row">
            <div class="col-md-6">
                <switch-dataset-card :selected-datasets="this.$store.getters.selectedDatasets" :active-dataset="this.$store.getters.activeDataset" style="min-height: 100%;"></switch-dataset-card>
            </div>
            <div class="col-md-6">
                <experiment-summary-card style="min-height: 100%;" v-if="!this.$store.getters.isDatasetSelectionInProgress"></experiment-summary-card>
                <load-datasets-card :selected-datasets="this.$store.getters.selectedDatasets" style="min-height: 100%;" v-else id="analysis-add-dataset-card"></load-datasets-card>
            </div>
        </div>
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
import SwitchDatasetCard from "unipept-web-components/src/components/dataset/SwitchDatasetCard.vue";
import ExperimentSummaryCard from "unipept-web-components/src/components/analysis/functional/ExperimentSummaryCard.vue";
import { EventBus } from "unipept-web-components/src/components/EventBus";
import PeptideContainer from "unipept-web-components/src/logic/data-management/PeptideContainer";


@Component({
    components: {
        FunctionalSummaryCard, 
        SingleDatasetVisualizationsCard, 
        LoadDatasetsCard, 
        SwitchDatasetCard, 
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
    created() {
        for (let dataset of this.$store.getters.selectedDatasets) {
            this.$store.dispatch('processDataset', dataset);
        }
    }

    private mounted() {
        this.initializeEventListeners();
    }

    private initializeEventListeners() {
        EventBus.$on("select-dataset", (dataset: PeptideContainer) => {
            this.$store.dispatch('selectDataset', dataset);
            this.$store.dispatch('processDataset', dataset);
        })
        
        EventBus.$on("activate-dataset", (dataset: PeptideContainer) => {
            this.$store.dispatch("setActiveDataset", dataset);
        })
    }
}
</script>

<style scoped>
</style>

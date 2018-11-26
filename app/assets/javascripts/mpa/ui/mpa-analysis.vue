<template>
    <div>
        <div class="row equal-height-row">
            <div class="col-md-6">
                <switch-dataset-card></switch-dataset-card>
            </div>
            <div class="col-md-6">
                <experiment-summary-card v-if="!this.$store.getters.isDatasetSelectionInProgress"></experiment-summary-card>
                <load-datasets-card v-else id="analysis-add-dataset-card"></load-datasets-card>
            </div>
        </div>
        <single-dataset-visualizations-card id="visualizations-card"></single-dataset-visualizations-card>
        <functional-summary-card></functional-summary-card>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import ExperimentSummaryCard from "./experiment-summary-card.vue";
    import SwitchDatasetCard from "./switch-dataset-card.vue";
    import LoadDatasetsCard from "./load-datasets-card.vue";
    import SingleDatasetVisualizationsCard from "./single-dataset-visualizations-card.vue";
    import NewPeptideContainer from "../NewPeptideContainer";
    import MpaAnalysisManager from "../MpaAnalysisManager";
    import FunctionalSummaryCard from "./functional-summary-card.vue";

    @Component({
        components: {
            FunctionalSummaryCard,
            SingleDatasetVisualizationsCard, LoadDatasetsCard, SwitchDatasetCard, ExperimentSummaryCard}
    })
    export default class MpaAnalysis extends Vue {
        private analysisManager: MpaAnalysisManager = new MpaAnalysisManager();

        created() {
            for (let dataset of this.$store.getters.selectedDatasets) {
                this.analysisManager.processDataset(dataset, this.$store.getters.searchSettings).then(
                    () => {
                        if (this.$store.getters.activeDataset == null) {
                            this.$store.dispatch('setActiveDataset', dataset);
                        }
                    }
                );
            }
        }

        /**
         * Propagate selections in the visualisation to the search tree and
         * The functional analysis data.
         *
         * @param id Taxon id to inspect
         * @param searchTerm Search term to put in box
         * @param [timeout=500] timeout in ms to wait before processing
         * @todo add search term to FA explanation to indicate filtering
         */
        search(id: number, searchTerm, timeout = 500) {
            let localTerm = searchTerm;
            if (localTerm === "Organism") {
                localTerm = "";
            }
            setTimeout(() => {
                let dataset: NewPeptideContainer = this.$store.getters.activeDataset;
                if (dataset && dataset.getDataset()) {
                    // searchTree.search(localTerm);
                    // this.redoFAcalculations(searchTerm, id, timeout);
                }
            });
        }
    }
</script>

<style scoped>

</style>

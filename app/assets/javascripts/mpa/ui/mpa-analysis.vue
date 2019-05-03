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
        <!-- <heatmap-wizard v-if="$store.getters.activeDataset && $store.getters.activeDataset.getProgress() === 1" :sample="$store.getters.activeDataset.dataset" :search-settings="$store.getters.searchSettings"></heatmap-wizard> -->
        <single-dataset-visualizations-card id="visualizations-card"></single-dataset-visualizations-card>
        <new-functional-summary-card></new-functional-summary-card>
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
    import NewFunctionalSummaryCard from "./new-functional-summary-card.vue";
    import HeatmapWizard from "./heatmap/heatmap-wizard.vue";

    @Component({
        components: {
            HeatmapWizard,
            NewFunctionalSummaryCard, SingleDatasetVisualizationsCard, LoadDatasetsCard, SwitchDatasetCard, ExperimentSummaryCard},
        computed: {
            selectedDatasets: {
                get() {
                    return this.$store.getters.selectedDatasets;
                }
            }
        }
    })
    export default class MpaAnalysis extends Vue {
        created() {
            for (let dataset of this.$store.getters.selectedDatasets) {
                this.$store.dispatch('processDataset', dataset);
            }
        }
    }
</script>

<style scoped>

</style>

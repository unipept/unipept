<template>
    <div>
        <!-- <div class="row equal-height-row">
            <div class="col-md-6">
                <switch-dataset-card style="min-height: 100%;"></switch-dataset-card>
            </div>
            <div class="col-md-6">
                <experiment-summary-card style="min-height: 100%;" v-if="!this.$store.getters.isDatasetSelectionInProgress"></experiment-summary-card>
                <load-datasets-card style="min-height: 100%;" v-else id="analysis-add-dataset-card"></load-datasets-card>
            </div>
        </div>
        <single-dataset-visualizations-card id="visualizations-card"></single-dataset-visualizations-card>
        <functional-summary-card style="margin-top: 12px;"></functional-summary-card> -->
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";

@Component({
    components: {
        // FunctionalSummaryCard, 
        // SingleDatasetVisualizationsCard, 
        // LoadDatasetsCard, 
        // SwitchDatasetCard, 
        // ExperimentSummaryCard
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
    // created() {
    //     for (let dataset of this.$store.getters.selectedDatasets) {
    //         this.$store.dispatch('processDataset', dataset);
    //     }
    // }
}
</script>

<style scoped>
</style>

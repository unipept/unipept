<template>
    <v-card style="min-height: 100%; display: flex; flex-direction: column;">
         <card-header class="card-title-interactive">
            <card-title>
                Metaproteomics Analysis
            </card-title>
            <div class="card-title-action">
                <tooltip message="Add another dataset to the selection.">
                    <v-icon @click="toggleDatasetSelection()" color="white">{{ this.isDatasetSelectionInProgress ? 'mdi-plus-circle' : 'mdi-plus' }}</v-icon>
                </tooltip>
            </div>
        </card-header>
        <v-card-text v-if="this.selectedDatasets.length === 0">
            <span>Please add one or more datasets by clicking the plus button above...</span>
        </v-card-text>
        <div class="growing-list">
            <v-list two-line>
                <v-list-item v-for="dataset of this.selectedDatasets" :key="dataset.id" ripple @click="activateDataset(dataset)" :class="activeDataset === dataset ? 'selected-list-item' : ''">
                    <v-list-item-action>
                        <div class="select-dataset-radio" v-if="dataset.progress === 1">
                            <v-radio-group v-model="activeDatasetModel">
                                <v-radio :value="dataset"></v-radio>
                            </v-radio-group>
                        </div>
                        <v-progress-circular v-else :rotate="-90" :size="24" :value="dataset.progress * 100" color="primary"></v-progress-circular>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ dataset.getName() }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            {{ dataset.getAmountOfPeptides() }} peptides
                        </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action>
                        <v-list-item-action-text>
                            {{ dataset.getDateFormatted() }}
                        </v-list-item-action-text>
                        <tooltip message="Remove dataset from analysis.">
                            <v-icon @click="deselectDataset(dataset)" v-on:click.stop>mdi-delete-outline</v-icon>
                        </tooltip>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
            <v-card-text>
                <v-divider></v-divider>
                <div class="card-actions">
                    <tooltip message="Compare samples above using a heatmap.">
                        <v-btn :disabled="$store.getters.selectedDatasets.some(el => el.progress !== 1)" @click="compareDatasets()">Compare samples</v-btn>
                    </tooltip>
                </div>
            </v-card-text>
        </div>
        <v-dialog v-model="dialogOpen" width="1000px">
            <div style="min-height: 600px; background-color: white;">
                <div class="modal-header" >
                    <button type="button" class="close" @click="dialogOpen = false"><span aria-hidden="true">×</span></button>
                    <h4 class="modal-title">Heatmap wizard</h4>
                </div>
                <div class="single-dataset-wizard">
                    <heatmap-wizard-multi-sample v-if="$store.getters.activeDataset" :dataset="$store.getters.activeDataset"></heatmap-wizard-multi-sample>
                    <div v-else>
                        <div class="text-xs-center" style="margin-top: 25px;">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </div>
                    </div>
                </div>
            </div>
        </v-dialog>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import PeptideContainer from "unipept-web-components/src/logic/data-management/PeptideContainer";

import CardHeader from "unipept-web-components/src/components/custom/CardHeader.vue";
import CardTitle from "unipept-web-components/src/components/custom/CardTitle.vue";

import HeatmapWizardMultiSample from "unipept-web-components/src/components/heatmap/HeatmapWizardMultiSample.vue";
import Tooltip from "unipept-web-components/src/components/custom/Tooltip.vue";
import { EventBus } from "unipept-web-components/src/components/EventBus";
import Assay from "unipept-web-components/src/logic/data-management/assay/Assay";

@Component({
    components: { CardTitle, CardHeader, HeatmapWizardMultiSample, Tooltip },
    computed: {
        activeDatasetModel: {
            get(): PeptideContainer {
                return this.activeDataset;
            },
            set(dataset: PeptideContainer): void {
                // Nothing to do here!
            }
        }
    }
})
export default class SwitchDatasetsCard extends Vue {
    @Prop({ required: true })
    private selectedDatasets: PeptideContainer[];
    @Prop({ required: true })
    private activeDataset: PeptideContainer;

    private dialogOpen: boolean = false;
    private isDatasetSelectionInProgress: boolean = false;

    private deselectDataset(dataset: PeptideContainer) {
        let idx: number = this.selectedDatasets.indexOf(dataset);
        this.selectedDatasets.splice(idx, 1);
        this.updateSelectedDatasets();
        EventBus.$emit("deselect-dataset", dataset);
    }

    private toggleDatasetSelection(): void {
        this.isDatasetSelectionInProgress = !this.isDatasetSelectionInProgress;
        EventBus.$emit("toggle-dataset-selection", this.isDatasetSelectionInProgress);
    }

    private compareDatasets(): void {
        this.dialogOpen = true;
    }

    private updateSelectedDatasets() {
        EventBus.$emit("update-selected-datasets", this.selectedDatasets);
    }

    private selectDataset(container: PeptideContainer) {
        EventBus.$emit("select-dataset", container);
    }

    /**
     * This function gets called whenever the user changes the currently active dataset. The active dataset is the 
     * dataset for which the visualizations are currently shown.
     * 
     * @param container The dataset that's currently activated by the user.
     */
    private activateDataset(container: Assay) {
        if (container.progress === 1) {
            EventBus.$emit("activate-dataset", container); 
        }
    }
}
</script>

<style lang="less">
    .selected-list-tile .v-list__tile:before {
        content: ' ';
        background-color: #2196F3;
        width: 4px;
        height: 100%;
        position: relative;
        left: -12px;
    }

    .selected-list-tile .v-list__tile {
        margin-left: -4px;
    }

    .growing-list {
        min-height: 100%;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .v-divider {
        margin-top: 15px;
        margin-bottom: 15px;
    }

    .select-dataset-radio .v-input--radio-group__input {
        margin-right: -16px;
    }
</style>

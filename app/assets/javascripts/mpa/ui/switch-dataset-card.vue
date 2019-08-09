<template>
    <card title="Metaproteomics Analysis" :interactive="true">
        <card-header class="card-title-interactive">
            <card-title>
                Metaproteomics Analysis
            </card-title>
            <div class="card-title-action">
                <span class="glyphicon glyphicon-equalizer" @click="compareDatasets()" style="margin-right: 5px;"></span>
                <span class="glyphicon glyphicon-plus" @click="addDataset()"></span>
            </div>
        </card-header>
        <card-body id="switch-dataset-card-body">
            <span v-if="this.$store.getters.selectedDatasets.length === 0">Please add one or more datasets by clicking the plus button above...</span>
            <v-list two-line>
                <template v-for="dataset of this.$store.getters.selectedDatasets">
                    <!-- Empty onClick required for ripple attribute -->
                    <v-list-tile :key="dataset.id" ripple @click="() => activeDataset = dataset" :class="activeDataset === dataset ? 'selected-list-tile' : ''">
                        <v-list-tile-action>
                            <v-radio-group v-if="dataset.progress === 1" v-model="activeDataset"><v-radio :value="dataset"></v-radio></v-radio-group>
                            <v-progress-circular v-else :rotate="-90" :size="24" :value="dataset.progress * 100" color="primary"></v-progress-circular>
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
                            <v-icon @click="deselectDataset(dataset)" v-on:click.stop>mdi-delete-outline</v-icon>
                        </v-list-tile-action>
                    </v-list-tile>
                </template>
            </v-list>
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

        </card-body>
    </card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Card from "../../components/card/card.vue";
    import PeptideContainer from "../PeptideContainer";
    import CardHeader from "../../components/card/card-header.vue";
    import CardTitle from "../../components/card/card-title.vue";
    import CardBody from "../../components/card/card-body.vue";
    import HeatmapWizardMultiSample from "./heatmap/heatmap-wizard-multi-sample.vue";

    @Component({
        components: {CardBody, CardTitle, CardHeader, Card, HeatmapWizardMultiSample},
        computed: {
            activeDataset: {
                get() {
                    return this.$store.getters.activeDataset;
                },
                set(dataset: PeptideContainer) {
                    this.$store.dispatch('setActiveDataset', dataset);
                }
            }
        }
    })
    export default class SwitchDatasetCard extends Vue {
        private dialogOpen: boolean = false;

        private deselectDataset(dataset: PeptideContainer): void {
            this.$store.dispatch('deselectDataset', dataset);
        }

        private addDataset(): void {
            this.$store.dispatch('setDatasetSelectionInProgress', !this.$store.getters.isDatasetSelectionInProgress);
        }

        private compareDatasets(): void {
            this.dialogOpen = true;
        }
    }
</script>

<style>
    .selected-list-tile .v-list__tile:before {
        content: ' ';
        background-color: #2196F3;
        width: 4px;
        height: 100%;
        position: relative;
        left: -12px;
    }

    .selected-list-tile .v-list__tile {
        position: relative;
        left: -4px;
    }
</style>

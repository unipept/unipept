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
            <list class="switch-dataset-list" placeholder="Please add one or more datasets by clicking the plus button above... ">
                <div class="list-item--two-lines" v-for="dataset of this.$store.getters.selectedDatasets" v-bind:key="dataset.id" :class="activeDataset === dataset ? 'selected' : ''">
                    <span class="list-item-primary-action">
                        <input v-if="dataset.progress === 1" v-model="activeDataset" :value="dataset" type="radio" class="input-item select-dataset-radio-button" style="width: 24px;" />
                        <determinate-circular-progress-indicator v-else :progress="dataset.progress" :size="24"></determinate-circular-progress-indicator>
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
                    <span class="list-item-secondary-action">
                        <span class="glyphicon glyphicon-trash" @click="deselectDataset(dataset)">
                        </span>
                    </span>
                </div>
            </list>

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
    import List from "../../components/list/list.vue";
    import PeptideContainer from "../PeptideContainer";
    import DeterminateCircularProgressIndicator from "../../components/progress/determinate-circular-progress-indicator.vue";
    import CardHeader from "../../components/card/card-header.vue";
    import CardTitle from "../../components/card/card-title.vue";
    import CardBody from "../../components/card/card-body.vue";
    import HeatmapWizardMultiSample from "./heatmap/heatmap-wizard-multi-sample.vue";

    @Component({
        components: {CardBody, CardTitle, CardHeader, DeterminateCircularProgressIndicator, Card, List, HeatmapWizardMultiSample},
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

<style scoped>

</style>

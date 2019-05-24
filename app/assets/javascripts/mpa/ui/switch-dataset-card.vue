<template>
    <card title="Metaproteomics Analysis" :interactive="true">
        <card-header class="card-title-interactive">
            <card-title>
                Metaproteomics Analysis
            </card-title>
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
    import HeatmapWizard from "./heatmap/heatmap-wizard.vue";

    @Component({
        components: {CardBody, CardTitle, CardHeader, DeterminateCircularProgressIndicator, Card, List, HeatmapWizard},
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
        private deselectDataset(dataset: PeptideContainer): void {
            this.$store.dispatch('deselectDataset', dataset);
        }

        private addDataset(): void {
            this.$store.dispatch('setDatasetSelectionInProgress', !this.$store.getters.isDatasetSelectionInProgress);
        }
    }
</script>

<style scoped>

</style>

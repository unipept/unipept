import {NormalizationType} from "./NormalizationType";

<template>
    <v-stepper v-model="currentStep" class="heatmap-wizard">
        <v-stepper-header>
            <v-stepper-step editable :complete="currentStep > 1" step="1">Data source</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 2" step="2">Normalisation</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 3" step="3" @click="computeHeatmapAndProceed()">Heatmap</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
            <v-stepper-content step="1">
                <p>Please select type of data that should be compared between samples.</p>
                <v-select :items="Array.from(dataSources.keys())" v-model="dataSource" label="Datasource"></v-select>
                <div>
                    <component v-if="!dataSourceLoading && dataSourceItem" :is="dataSources.get(dataSource).dataSourceComponent" :dataSource="dataSourceItem" v-on:selected-items="updateSelectedItems"></component>
                    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
                </div>
                <simple-button style="float: right;" label="Continue" type="primary" class="wizard-action" @click="currentStep++"></simple-button>
            </v-stepper-content>
            <v-stepper-content step="2">
                <p>Please select the type of normalization that should be performed before visualizing data points.</p>
                <v-radio-group v-model="normalizer">
                    <div v-for="normalizationType in Array.from(normalizationTypes.keys())" :key="normalizationType" style="margin-bottom: 8px;">
                        <v-radio :label="normalizationType" :value="normalizationType"></v-radio>
                        <div style="margin-left: 32px;">{{ normalizationTypes.get(normalizationType).information }}</div>
                    </div>
                </v-radio-group>
                <simple-button style="float: right;" label="Continue" type="primary" class="wizard-action" @click="computeHeatmapAndProceed()"></simple-button>
            </v-stepper-content>
            <v-stepper-content step="3">
                <div v-if="selectedItems.length === 0">
                    Please select at least one item for both axis of the heatmap.
                </div>
                <v-progress-circular v-if="!heatmapData && selectedItems.length !== 0" indeterminate color="primary"></v-progress-circular>
                <heatmap-visualization v-if="heatmapData && selectedItems.length !== 0" :data="heatmapData"></heatmap-visualization>
            </v-stepper-content>
        </v-stepper-items>
    </v-stepper>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Watch, Prop} from "vue-property-decorator";
    import SimpleButton from "../../../components/button/simple-button.vue";
    import HeatmapConfiguration from "./HeatmapConfiguration";
    import DataSource from "../../datasource/DataSource";
    import TaxaDataSource from "../../datasource/TaxaDataSource";
    import EcDataSource from "../../datasource/EcDataSource";
    import GoDataSource from "../../datasource/GoDataSource";
    import AllNormalizer from "../../heatmap/AllNormalizer";
    import RowNormalizer from "../../heatmap/RowNormalizer";
    import ColumnNormalizer from "../../heatmap/ColumnNormalizer";
    import { Normalizer } from "../../heatmap/Normalizer";
    import Sample from "../../Sample";
    import PeptideContainer from "../../PeptideContainer";
    import GoDataSourceComponent from "./go-data-source-component.vue";
    import EcDataSourceComponent from "./ec-data-source-component.vue";
    import TaxaDataSourceComponent from "./taxa-data-source-component.vue";
    import { HeatmapData, HeatmapElement } from "unipept-heatmap/heatmap/input";
    import HeatmapVisualization from "../visualizations/heatmap-visualization.vue";
    import Element from "../../datasource/Element";
    import sha256 from "crypto-js/sha256";

    @Component({
        components: {SimpleButton, GoDataSourceComponent, EcDataSourceComponent, TaxaDataSourceComponent, HeatmapVisualization}
    })
    export default class HeatmapWizardMultiSample extends Vue {
        @Prop()
        private dataset: PeptideContainer;
        @Prop()
        private searchSettings: MPAConfig;

        private currentStep: number = 1;
        private heatmapConfiguration: HeatmapConfiguration = new HeatmapConfiguration();

        private heatmapData: HeatmapData = null;
        // Keeps track of a hash of the previously computed data for the heatmap
        private previouslyComputed: string = "";

        private dataSources: Map<string, {dataSourceComponent: string, factory: () => Promise<DataSource>}> = new Map([
            [
                "Taxa",
                {
                    dataSourceComponent: "taxa-data-source-component",
                    factory: () => {
                        let dataRepository = this.dataset.getDataset().dataRepository;
                        return dataRepository.createTaxaDataSource();
                    }
                }
                
            ],
            [
                "EC-Numbers", 
                {
                    dataSourceComponent: "ec-data-source-component",
                    factory: () => {
                        let dataRepository = this.dataset.getDataset().dataRepository;
                        return dataRepository.createEcDataSource();
                    }
                }
                
            ],
            [
                "GO-Terms", 
                {
                    dataSourceComponent: "go-data-source-component",
                    factory: () => {
                        let dataRepository = this.dataset.getDataset().dataRepository;
                        return dataRepository.createGoDataSource();
                    }
                }
            ]
        ]);

        private normalizationTypes: Map<string, {information: string, factory: () => Normalizer}> = new Map([
            [
                "All",
                {
                    information: "Normalize over all data points of the input.",
                    factory: () => new AllNormalizer()
                }
            ],
            [
                "Rows",
                {
                    information: "Normalize values on a row-per-row basis.",
                    factory: () => new RowNormalizer()
                }
            ],
            [
                "Columns",
                {
                    information: "Normalize values on a column-per-column basis.",
                    factory: () => new ColumnNormalizer()
                }
            ]
        ]);

        private dataSource: string = "";
        private dataSourceItem: DataSource = null;
        private dataSourceLoading: boolean = false;
        private selectedItems: Element[] = [];
        private normalizer: string = "";

        created() {
            this.dataSource = this.dataSources.keys().next().value;
            this.normalizer = this.normalizationTypes.keys().next().value;
        }

        mounted() {
            this.onHorizontalSelection(this.dataSource);
            this.onNormalizerChange(this.normalizer);
        }

        @Watch("dataSource") 
        async onHorizontalSelection(newValue: string){
            this.dataSourceLoading = true;
            this.dataSourceItem = await this.dataSources.get(newValue).factory();
            this.dataSourceLoading = false;
        }

        @Watch("normalizer") 
        async onNormalizerChange(newValue: string) {
            this.heatmapConfiguration.normalizer = await this.normalizationTypes.get(newValue).factory();
        }

        updateSelectedItems(newItems: Element[]) {
            this.selectedItems = newItems;
        }

        private async computeHeatmapAndProceed() {
            let newHash = sha256(this.normalizer + this.dataSource + this.selectedItems.toString()).toString();

            if (newHash === this.previouslyComputed) {
                return;
            }

            this.previouslyComputed = newHash;

            // Go the next step in the wizard.
            this.currentStep = 3;

            let rows: HeatmapElement[] = [];
            let cols: HeatmapElement[] = [];

            let grid: number[][] = [];
            
            for (let i = 0; i < this.selectedItems.length; i++) {
                let item: Element = this.selectedItems[i];
                rows.push({id: i.toString(), name: item.name});
            }

            for (let i = 0; i < this.$store.getters.selectedDatasets.length; i++) {
                let item: PeptideContainer = this.$store.getters.selectedDatasets[i];
                cols.push({id: i.toString(), name: item.getName()});
            }

            for (let item of this.selectedItems) {
                let gridRow: number[] = [];
                for (let container of this.$store.getters.selectedDatasets) {
                    let value: number = (await item.getAffectedPeptides(container.getDataset())).length;
                    gridRow.push(value);
                }
                grid.push(gridRow);
            }

            this.heatmapData = {
                rows: rows,
                columns: cols,
                values: this.heatmapConfiguration.normalizer.normalize(grid)
            };
        }
    }
</script>

<style scoped>
</style>

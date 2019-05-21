import {NormalizationType} from "./NormalizationType";

<template>
    <v-stepper v-model="currentStep" style="margin-top: 15px;" class="heatmap-wizard">
        <v-stepper-header>
            <v-stepper-step editable :complete="currentStep > 1" step="1">Horizontal axis</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 2" step="2">Vertical axis</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 3" step="3">Normalisation</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 4" step="4">Heatmap</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
            <v-stepper-content step="1">
                <p>Please select the items that should be visualised on the horizontal axis of the heatmap.</p>
                <v-select :items="Array.from(dataSources.keys())" v-model="horizontalDataSource" label="Datasource"></v-select>
                <div>
                    <component v-if="!heatmapConfiguration.horizontalLoading" :is="dataSources.get(horizontalDataSource).dataSourceComponent" :dataSource="heatmapConfiguration.horizontalDataSource" v-on:selected-items="updateHorizontalSelectedItems"></component>
                    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
                </div>
                <simple-button style="float: right;" label="Continue" type="primary" class="wizard-action" @click="currentStep++"></simple-button>
            </v-stepper-content>
            <v-stepper-content step="2">
                <p>Please select the items that should be visualised on the vertical axis of the heatmap.</p>
                <v-select :items="Array.from(dataSources.keys())" v-model="verticalDataSource" label="Datasource"></v-select>
                <div>
                    <component v-if="!heatmapConfiguration.verticalLoading" :is="dataSources.get(verticalDataSource).dataSourceComponent" :dataSource="heatmapConfiguration.verticalDataSource" v-on:selected-items="updateVerticalSelectedItems"></component>
                    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
                </div>
                <simple-button style="float: right;" label="Continue" type="primary" class="wizard-action" @click="currentStep++"></simple-button>
            </v-stepper-content>
            <v-stepper-content step="3">
                <p>Please select the type of normalization that should be performed before visualizing data points.</p>
                <v-select :items="Array.from(normalizationTypes.keys())" v-model="normalizer" label="Normalization type"></v-select>
                <p>{{ normalizationTypes.get(normalizer).information }}</p>
                <simple-button style="float: right;" label="Continue" type="primary" class="wizard-action" @click="computeHeatmapAndProceed()"></simple-button>
            </v-stepper-content>
            <v-stepper-content step="4">
                <div v-if="heatmapConfiguration.horizontalSelectedItems.length === 0 || heatmapConfiguration.verticalSelectedItems.length === 0">
                    Please select at least one item for both axis of the heatmap.
                </div>
                <v-progress-circular v-if="!heatmapData && heatmapConfiguration.horizontalSelectedItems.length !== 0  && heatmapConfiguration.verticalSelectedItems.length !== 0" indeterminate color="primary"></v-progress-circular>
                <heatmap-visualization v-if="heatmapData && heatmapConfiguration.horizontalSelectedItems.length !== 0  && heatmapConfiguration.verticalSelectedItems.length !== 0" :data="heatmapData"></heatmap-visualization>
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

    @Component({
        components: {SimpleButton, GoDataSourceComponent, EcDataSourceComponent, TaxaDataSourceComponent, HeatmapVisualization}
    })
    export default class HeatmapWizard extends Vue {
        @Prop()
        private dataset: PeptideContainer;
        @Prop()
        private searchSettings: MPAConfig;

        private currentStep: number = 1;
        private heatmapConfiguration: HeatmapConfiguration = new HeatmapConfiguration();

        private heatmapData: HeatmapData = null;

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

        private horizontalDataSource: string = "";
        private verticalDataSource: string = "";
        private normalizer: string = "";

        created() {
            this.horizontalDataSource = this.dataSources.keys().next().value;
            this.verticalDataSource = this.dataSources.keys().next().value;
            this.normalizer = this.normalizationTypes.keys().next().value;
        }

        mounted() {
            this.onHorizontalSelection(this.horizontalDataSource);
            this.onVerticalSelection(this.verticalDataSource);
            this.onNormalizerChange(this.normalizer);
        }

        @Watch("horizontalDataSource") 
        async onHorizontalSelection(newValue: string){
            this.heatmapConfiguration.horizontalLoading = true;
            this.heatmapConfiguration.horizontalDataSource = await this.dataSources.get(newValue).factory();
            this.heatmapConfiguration.horizontalLoading = false;
        }

        @Watch("verticalDataSource") 
        async onVerticalSelection(newValue: string) {
            this.heatmapConfiguration.verticalLoading = true;
            this.heatmapConfiguration.verticalDataSource = await this.dataSources.get(newValue).factory();
            this.heatmapConfiguration.verticalLoading = false;
        }

        @Watch("normalizer") 
        async onNormalizerChange(newValue: string) {
            this.heatmapConfiguration.normalizer = await this.normalizationTypes.get(newValue).factory();
        }

        updateHorizontalSelectedItems(newItems: Element[]) {
            this.heatmapConfiguration.horizontalSelectedItems = newItems;
        }

        updateVerticalSelectedItems(newItems: Element[]) {
            this.heatmapConfiguration.verticalSelectedItems = newItems;
        }

        private async computeHeatmapAndProceed() {
            // Go the next step in the wizard.
            this.currentStep = 4;

            let rows: HeatmapElement[] = [];
            let cols: HeatmapElement[] = [];

            let grid: number[][] = [];

            let min: number = Infinity;
            let max: number = 0;

            for (let i = 0; i < this.heatmapConfiguration.verticalSelectedItems.length; i++) {
                let vertical: Element = this.heatmapConfiguration.verticalSelectedItems[i];
                rows.push({id: i.toString(), name: vertical.name});
            }

            for (let i = 0; i < this.heatmapConfiguration.horizontalSelectedItems.length; i++) {
                let horizontal: Element = this.heatmapConfiguration.horizontalSelectedItems[i];
                cols.push({id: i.toString(), name: horizontal.name});
            }

            for (let vertical of this.heatmapConfiguration.verticalSelectedItems) {
                let gridRow: number[] = [];
                for (let horizontal of this.heatmapConfiguration.horizontalSelectedItems) {
                    let value: number = await vertical.computeCrossPopularity(horizontal, this.dataset.getDataset());
                    min = Math.min(value, min);
                    max = Math.max(value, max);
                    gridRow.push(value);
                }
                grid.push(gridRow);
            }

            for (let row = 0; row < grid.length; row++) {
                for (let col = 0; col < grid[row].length; col++) {
                    grid[row][col] = (grid[row][col] - min) / (max - min);
                }
            }

            this.heatmapData = {
                rows: rows,
                columns: cols,
                values: grid
            };

            console.log(this.heatmapData);
        }
    }
</script>

<style scoped>
</style>

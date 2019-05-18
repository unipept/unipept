import {NormalizationType} from "./NormalizationType";

<template>
    <v-stepper v-model="currentStep" style="margin-top: 15px;">
        <v-stepper-header>
            <v-stepper-step editable :complete="currentStep > 1" step="1">Axis</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 2" step="2">Normalisation</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 3" step="3">Datasources</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step editable :complete="currentStep > 4" step="4">Heatmap</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
            <v-stepper-content step="1">
                <p>Please select the type of data points that should be visualized for each axis of the heatmap.</p>
                <v-select :items="Array.from(dataSources.keys())" v-model="horizontalDataSource" label="Horizontal axis"></v-select>
                <v-select :items="Array.from(dataSources.keys())" v-model="verticalDataSource" label="Vertical axis"></v-select>
                <simple-button style="float: right;" label="Continue" type="primary" @click="currentStep++"></simple-button>
            </v-stepper-content>
            <v-stepper-content step="2">
                <p>Please select the type of normalization that should be performed before visualizing data points.</p>
                <v-select :items="Array.from(normalizationTypes.keys())" v-model="normalizer" label="Normalization type"></v-select>
                <p>{{ normalizationTypes.get(normalizer).information }}</p>
                <simple-button style="float: right;" label="Continue" type="primary" @click="currentStep++"></simple-button>
            </v-stepper-content>
            <v-stepper-content step="3">
                <p>Choose a set of data points that should visualized as part of the final heatmap.</p>
                <span>Horizontal data:</span>
                <div>
                    <component v-if="heatmapConfiguration.horizontalDataSource" :is="dataSources.get(horizontalDataSource).dataSourceComponent" :dataSource="heatmapConfiguration.horizontalDataSource"></component>
                    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
                </div>
                <span>Vertical data:</span>
                <div>
                    <component v-if="heatmapConfiguration.verticalDataSource" :is="dataSources.get(verticalDataSource).dataSourceComponent" :dataSource="heatmapConfiguration.verticalDataSource"></component>
                    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
                </div>
            </v-stepper-content>
            <v-stepper-content step="4">
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

    @Component({
        components: {SimpleButton, GoDataSourceComponent, EcDataSourceComponent, TaxaDataSourceComponent}
    })
    export default class HeatmapWizard extends Vue {
        @Prop()
        private dataset: PeptideContainer;
        @Prop()
        private searchSettings: MPAConfig;

        private currentStep: number = 1;
        private heatmapConfiguration: HeatmapConfiguration = new HeatmapConfiguration();

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
            this.heatmapConfiguration.horizontalDataSource = null;
            this.heatmapConfiguration.horizontalDataSource = await this.dataSources.get(newValue).factory();
        }

        @Watch("verticalDataSource") 
        async onVerticalSelection(newValue: string) {
            this.heatmapConfiguration.verticalDataSource = null;
            this.heatmapConfiguration.verticalDataSource = await this.dataSources.get(newValue).factory();
        }

        @Watch("normalizer") 
        async onNormalizerChange(newValue: string) {
            this.heatmapConfiguration.normalizer = await this.normalizationTypes.get(newValue).factory();
        }
    }
</script>

<style scoped>

</style>

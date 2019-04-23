import {NormalizationType} from "./NormalizationType";
<template>
    <v-stepper v-model="currentStep" style="margin-top: 15px;">
        <v-stepper-header>
            <v-stepper-step :complete="currentStep > 1" step="1">Select axes</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="currentStep > 2" step="2">First axis</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="currentStep > 3" step="3">Second axis</v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
            <v-stepper-content step="1">
                <v-alert :value="true" color="info" outline icon="info" style="margin-bottom: 10px;">
                    This wizard will guide you through the process of automatically constructing a Heatmap. Before we
                    can generate a Heatmap, we need to know a few configuration details. Please select the type of data
                    that should be displayed on either axis of the Heatmap.
                </v-alert>
                <v-select :items="datasources" :item-value="(item) => item.name" v-model="heatmapConfiguration.horizontalDataSource" label="Horizontal axis">
                </v-select>
                <!--<v-select :items="datasources" v-model="heatmapConfiguration.verticalDataSource" label="Vertical axis">-->
                <!--</v-select>-->
                <simple-button style="float: right;" label="Continue" type="primary" @click="currentStep++"></simple-button>
            </v-stepper-content>
            <v-stepper-content step="2">
                Select the type of normalization that should be performed for your new heatmap.
                <v-select :items="NormalizationType.entries" v-model="heatmapConfiguration.normalizationType" label="normalization"></v-select>
                <p></p>
                <simple-button style="float: right;" label="Continue" type="primary" @click="currentStep++"></simple-button>
            </v-stepper-content>
        </v-stepper-items>
    </v-stepper>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Watch} from "vue-property-decorator";
    import SimpleButton from "../../../components/button/simple-button.vue";
    import {NormalizationType} from "../../heatmap/NormalizationType";
    import HeatmapConfiguration from "./HeatmapConfiguration";
    import DataSource from "../../heatmap/DataSource";
    import TaxaDataSource from "../../heatmap/TaxaDataSource";
    import EcDataSource from "../../heatmap/EcDataSource";
    import GoDataSource from "../../heatmap/GoDataSource";

    @Component({
        components: {SimpleButton}
    })
    export default class HeatmapWizard extends Vue {
        private currentStep: number = 1;
        private heatmapConfiguration: HeatmapConfiguration = new HeatmapConfiguration();

        private datasources: {name: string, factory: () => DataSource}[] = [{
            name: "Taxa",
            factory: () => new TaxaDataSource()
        }, {
            name: "EC-Numbers",
            factory: () => new EcDataSource()
        }, {
            name: "GO-Terms",
            factory: () => new GoDataSource()
        }];
    }
</script>

<style scoped>

</style>

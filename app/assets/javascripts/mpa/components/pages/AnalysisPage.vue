<template>
    <div>
        <v-row class="equal-height-row">
            <v-col>
                <switch-datasets-card
                    v-on:deselect-assay="onDeselectAssay"
                    v-on:activate-assay="onActivateAssay"
                    v-on:assay-selection-in-progress="onAssaySelection"
                    style="min-height: 100%;">
                </switch-datasets-card>
            </v-col>
            <v-col>
                <experiment-summary-card
                    v-if="!datasetSelectionInProgress"
                    style="min-height: 100%;"
                    :disabled="inProgress"
                    :activeAssay="$store.getters.activeAssay"
                    :searchConfiguration="$store.getters.searchConfiguration"
                    :communicationSource="communicationSource"
                    v-on:update-search-settings="onUpdateSearchSettings">
                </experiment-summary-card>
                <load-datasets-card
                    v-else
                    v-on:create-assay="onCreateAssay"
                    style="min-height: 100%;"
                    id="analysis-add-dataset-card">
                </load-datasets-card>
            </v-col>
        </v-row>
        <single-dataset-visualizations-card
            id="visualizations-card"
            :assay="activeAssay"
            :analysisInProgress="$store.getters.assays.length > 0"
            v-on:update-selected-term="onUpdateSelectedTerm"
            v-on:update-selected-taxon-id="onUpdateSelectedTaxonId">
        </single-dataset-visualizations-card>
        <functional-summary-card
            style="margin-top: 12px;"
            :assay="activeAssay"
            :analysisInProgress="$store.getters.assays.length > 0"
            :selected-taxon-id="$store.getters.getSelectedTaxonId">
        </functional-summary-card>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import {
    FunctionalSummaryCard,
    ProteomicsAssay,
    SearchConfiguration,
    CountTable,
    Peptide,
    SingleDatasetVisualizationsCard,
    CommunicationSource
} from "unipept-web-components";

import LoadDatasetsCard from "./../dataset/LoadDatasetsCard.vue";
import SwitchDatasetsCard from "./../dataset/SwitchDatasetsCard.vue";
import ExperimentSummaryCard from "./../dataset/ExperimentSummaryCard.vue";

@Component({
    components: {
        FunctionalSummaryCard,
        SingleDatasetVisualizationsCard,
        LoadDatasetsCard,
        SwitchDatasetsCard,
        ExperimentSummaryCard
    }
})
export default class AnalysisPage extends Vue {
    private datasetSelectionInProgress: boolean = false;

    get activeAssay(): ProteomicsAssay {
        return this.$store.getters.activeAssay;
    }

    get inProgress(): boolean {
        return this.$store.getters.assays.some(a => a.analysisMetaData.progress < 1);
    }

    get communicationSource(): CommunicationSource {
        const activeAssay = this.$store.getters.activeAssay;
        if (activeAssay) {
            return this.$store.getters.assayData(activeAssay).communicationSource;
        } else {
            return undefined;
        }
    }

    get activeProgress(): number {
        if (!this.activeAssay) {
            return 0;
        }
        return this.$store.getters.assayData(this.activeAssay)?.analysisMetaData.progress;
    }

    created() {
        this.reprocessAssays();
    }

    private onDeselectAssay(assay: ProteomicsAssay) {
        this.$store.dispatch("removeAssay", assay);
    }

    private onActivateAssay(assay: ProteomicsAssay) {
        this.$store.dispatch("activateAssay", assay);
    }

    private onCreateAssay(assay: ProteomicsAssay) {
        this.$store.dispatch("processAssay", assay);
    }

    private onAssaySelection(status: boolean) {
        this.datasetSelectionInProgress = status;
    }

    private onUpdateSearchSettings(settings: SearchConfiguration) {
        // We need to reprocess all assays with the new search settings.
        this.$store.dispatch("setSearchConfiguration", settings);
        this.reprocessAssays();
    }

    private reprocessAssays() {
        for (const data of this.$store.getters.assays) {
            data.assay.setSearchConfiguration(this.$store.getters.searchConfiguration);
            this.$store.dispatch("processAssay", data.assay);
        }
    }

    private onUpdateSelectedTerm(term: string) {
        this.$store.dispatch('setSelectedTerm', term);
    }

    private onUpdateSelectedTaxonId(id: string) {
        this.$store.dispatch('setSelectedTaxonId', id);
    }
}
</script>

<style>
    #analysis-add-dataset-card::before {
        content:"\A";
        border-top: 24px solid transparent;
        border-bottom: 24px solid transparent;
        border-right: 24px solid #2196F3;
        z-index: 5;
        position: absolute;
        left: -24px;
    }

    #analysis-add-dataset-card {
        border-top-left-radius: 0px;
    }
</style>

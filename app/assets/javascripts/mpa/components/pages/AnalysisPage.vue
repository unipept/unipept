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
                    :disabled="$store.getters.isInProgress"
                    :activeAssay="$store.getters.getActiveAssay"
                    :searchConfiguration="$store.getters.getSearchConfiguration"
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
            :peptide-count-table="countTable"
            :search-configuration="$store.getters.getSearchConfiguration"
            :analysisInProgress="$store.getters.getAssays.length > 0"
            v-on:update-selected-term="onUpdateSelectedTerm"
            v-on:update-selected-taxon-id="onUpdateSelectedTaxonId">
        </single-dataset-visualizations-card>
        <functional-summary-card
            style="margin-top: 12px;"
            :peptide-count-table="countTable"
            :search-configuration="$store.getters.getSearchConfiguration"
            :analysisInProgress="$store.getters.getAssays.length > 0"
            :selected-taxon-id="$store.getters.getSelectedTaxonId">
        </functional-summary-card>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import FunctionalSummaryCard from "unipept-web-components/src/components/analysis/functional/FunctionalSummaryCard.vue";
import SingleDatasetVisualizationsCard from "unipept-web-components/src/components/visualizations/SingleDatasetVisualizationsCard.vue";
import LoadDatasetsCard from "./../dataset/LoadDatasetsCard.vue";
import SwitchDatasetsCard from "./../dataset/SwitchDatasetsCard.vue";
import ExperimentSummaryCard from "unipept-web-components/src/components/analysis/statistics/ExperimentSummaryCard.vue";
import ProteomicsAssay from "unipept-web-components/src/business/entities/assay/ProteomicsAssay";
import SearchConfiguration from "unipept-web-components/src/business/configuration/SearchConfiguration";
import { CountTable } from "unipept-web-components/src/business/counts/CountTable";
import { Peptide } from "unipept-web-components/src/business/ontology/raw/Peptide";

@Component({
    components: {
        FunctionalSummaryCard,
        SingleDatasetVisualizationsCard,
        LoadDatasetsCard,
        SwitchDatasetsCard,
        ExperimentSummaryCard
    },
    computed: {
        selectedDatasets: {
            get() {
                return this.$store.getters.getAssays;
            }
        },
        countTable: {
            get(): CountTable<Peptide> {
                if (this.$store.getters.getActiveAssay) {
                    return this.$store.getters.getProgressStatesMap[this.$store.getters.getActiveAssay.getId()].countTable;
                } else {
                    return undefined;
                }
            }
        }
    }
})
export default class AnalysisPage extends Vue {
    private datasetSelectionInProgress: boolean = false;
    private eventListeners: {type: string, listener: any}[] = [];

    created() {
        this.reprocessAssays();
    }

    private onDeselectAssay(assay: ProteomicsAssay) {
        this.$store.dispatch("removeAssay", assay);
    }

    private onActivateAssay(assay: ProteomicsAssay) {
        this.$store.dispatch("setActiveAssay", assay);
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
        for (const assay of this.$store.getters.getAssays) {
            this.$store.dispatch("processAssay", assay);
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

<template>
    <v-card style="display: flex; flex-direction: column;">
        <card-header>
            <card-title>
                Metaproteomics Analysis
            </card-title>
        </card-header>
        <v-card-text style="display: flex; flex-direction: column; flex-grow: 1; padding: 0;">
            <div style="padding-top: 16px; padding-left: 16px; padding-right: 16px;">
                <h3>Selected datasets</h3>
                <span v-if="$store.getters.assays.length === 0" :class="{'shaking': shaking, 'selected-placeholder': true}">
                    Please select one or more datasets from the right hand panel to continue the analysis.
                </span>
            </div>
            <v-list two-line class="switch-datasets-list" style="flex-grow: 1;">
                <v-list-item v-for="dataset of $store.getters.assays" two-line :key="dataset.id" >
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ dataset.assay.getName() }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            {{ dataset.assay.getAmountOfPeptides() }} peptides
                        </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action>
                        <v-list-item-action-text>
                            {{ dataset.assay.getDate().toLocaleDateString() }}
                        </v-list-item-action-text>
                        <tooltip message="Remove dataset from analysis.">
                            <v-btn class="fix-icon-list-position" text icon @click="deselectDataset(dataset.assay)">
                                <v-icon color="grey darken-1">mdi-delete-outline</v-icon>
                            </v-btn>
                        </tooltip>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
            <div style="padding-bottom: 16px; padding-left: 16px; padding-right: 16px;">
                <div class="subtitle-1">Search settings</div>
                <search-settings-form
                    :equate-il.sync="equateIl"
                    :filter-duplicates.sync="filterDuplicates"
                    :missing-cleavage.sync="missingCleavage"
                    :horizontal="false"
                    class="selected-dataset-settings">
                </search-settings-form>
                <div class="text-center">
                    <v-btn @click="search()" color="primary">
                        <v-icon left>
                            mdi-magnify
                        </v-icon>
                        Search
                    </v-btn>
                    <v-btn @click="reset()">
                        <v-icon left>
                            mdi-restore
                        </v-icon>
                        Start over
                    </v-btn>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import {
    SearchSettingsForm,
    CardTitle,
    CardHeader,
    Tooltip,
    SearchConfiguration,
    ProteomicsAssay
} from "unipept-web-components";

@Component({
    components: { CardHeader, CardTitle, SearchSettingsForm, Tooltip }
})
/**
 * This component shows a summary of all assays that are currently selected by the user for analysis. It allows the user
 * to deselect these datasets, or to start analysis. The set of selected datasets is not updated by this component
 * itself. That is the responsibility of the parent component, which should properly react to the events emitted and
 * update the set of selected datasets accordingly.
 *
 * @vue-event {Assay} deselect-dataset Emitted when user deselects a previously chosen assay.
 * @vue-event {void} start-analysis Emitted when user indicates that he wants to start analysis of the chosen
 *            assays.
 * @vue-event {SearchConfiguration} update-search-settings
 */
export default class SelectDatasetsCard extends Vue {
    private equateIl: boolean = true;
    private filterDuplicates: boolean = true;
    private missingCleavage: boolean = false;

    private shaking: boolean = false;

    private mounted() {
        const searchConfig = this.$store.getters.searchConfiguration;
        this.equateIl = searchConfig.equateIl;
        this.filterDuplicates = searchConfig.filterDuplicates;
        this.missingCleavage = searchConfig.enableMissingCleavageHandling;
    }

    public search(): void {
        if (this.$store.getters.assays.length === 0) {
            this.shaking = true;
            // Disable the shaking effect after 300ms
            setTimeout(() => this.shaking = false, 300);
        } else {
            this.startAnalysis();
        }
    }

    private reset(): void {
        for (let data of this.$store.getters.assays) {
            this.deselectDataset(data.assay);
        }
    }

    private startAnalysis() {
        this.$emit("start-analysis", true);
    }

    private deselectDataset(assay: ProteomicsAssay) {
        this.$emit("deselect-assay", assay);
    }

    @Watch("equateIl")
    @Watch("filterDuplicates")
    @Watch("missingCleavage")
    private updateSearchSettings() {
        this.$store.dispatch("setSearchConfiguration", new SearchConfiguration(
            this.equateIl,
            this.filterDuplicates,
            this.missingCleavage
        ));
        this.$emit("update-search-settings")
    }
}
</script>

<style lang="less">
    .v-input__control label {
        margin-bottom: 0px;
    }

    .selected-dataset-settings {
        margin-bottom: 5px;
    }

    .switch-datasets-list {
        flex-grow: 1;
    }

    .shaking {
        animation-name: shaker;
        animation-duration: 0.2s;
        transform-origin: 50% 50%;
        animation-timing-function: linear;
    }

    @keyframes shaker {
        0% { transform: translate(5px, 0); }
        50% { transform: translate(-5px, 0); }
        100% { transform: translate(5px, 0); }
    }

    .selected-placeholder {
        display: inline-block;
    }
</style>

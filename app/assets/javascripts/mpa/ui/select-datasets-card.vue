<template>
    <v-card style="display: flex; flex-direction: column;">
        <card-header>
            <card-title>
                Metaproteomics Analysis
            </card-title>
        </card-header>
        <div style="display: flex; flex-direction: column; flex-grow: 1;">
            <v-card-text style="padding-bottom: 0;">
                <label style="display: block;">Selected datasets</label>
                <span v-if="selectedDatasets.length === 0" :class="{'shaking': shaking, 'selected-placeholder': true}">Please select one or more datasets from the right hand panel to continue the analysis..</span>
            </v-card-text>
            <v-list two-line class="switch-datasets-list" style="flex-grow: 1;">
                <template v-for="dataset of selectedDatasets">
                    <v-list-tile :key="dataset.id" >
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
                            <tooltip message="Deselect dataset">
                                <v-icon @click="deselectDataset(dataset)" class="fix-icon-list-position">mdi-delete-outline</v-icon>
                            </tooltip>
                        </v-list-tile-action>
                    </v-list-tile>
                </template>
            </v-list>
            <v-card-text>
                <search-settings-form
                    :equate-il="equateIl"
                    v-on:equate-il-change="equateIl = $event"
                    :filter-duplicates="filterDuplicates"
                    v-on:filter-duplicates-change="filterDuplicates = $event"
                    :missing-cleavage="missingCleavage"
                    v-on:missing-cleavage="missingCleavage = $event"
                    class="selected-dataset-settings">
                </search-settings-form>            
                <div class="search-buttons-centered">
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
            </v-card-text>
        </div>
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import PeptideContainer from "../PeptideContainer";
    import SearchSettingsForm from "./search-settings-form.vue";
    import CardTitle from "../../components/card/card-title.vue";
    import CardHeader from "../../components/card/card-header.vue";

    @Component({
        components: {CardHeader, CardTitle, SearchSettingsForm}
    })
    export default class SelectDatasetsCard extends Vue {
        private selectedDatasets = this.$store.getters.selectedDatasets;

        private equateIl: boolean = true;
        private filterDuplicates: boolean = true;
        private missingCleavage: boolean = false;

        private shaking: boolean = false;

        created() {
            this.equateIl = this.$store.getters.searchSettings.il;
            this.filterDuplicates = this.$store.getters.searchSettings.dupes;
            this.missingCleavage = this.$store.getters.searchSettings.missed;
        }

        deselectDataset(dataset: PeptideContainer) {
            this.$store.dispatch('deselectDataset', dataset);
        }

        search(): void {
            if (this.$store.getters.selectedDatasets.length === 0) {
                this.shaking = true;
                // Disable the shaking effect after 300ms
                setTimeout(() => this.shaking = false, 300);
            } else {
                this.$store.dispatch('setSearchSettings', {il: this.equateIl, dupes: this.filterDuplicates, missed: this.missingCleavage});
                this.$store.dispatch('setAnalysis', true);
            }
        }

        reset(): void {
            this.equateIl = true;
            this.filterDuplicates = true;
            this.missingCleavage = false;
            this.$store.dispatch('clearSelectedDatasets');
        }
    }
</script>

<style>
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

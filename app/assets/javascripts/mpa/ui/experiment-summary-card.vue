<template>
    <div style="height: 100%;">
        <card style="margin-bottom: 0">
            <card-header>
                <card-title>Experiment summary</card-title>
            </card-header>
            <card-body>
                <search-settings-form
                        :disabled="$store.getters.selectedDatasets.some(el => el.getProgress() !== 1)"
                        :equate-il="equateIl"
                        v-on:equate-il-change="equateIl = $event"
                        :filter-duplicates="filterDuplicates"
                        v-on:filter-duplicates-change="filterDuplicates = $event"
                        :missing-cleavage="missingCleavage"
                        v-on:missing-cleavage="missingCleavage = $event"
                ></search-settings-form>
                <div class="search-buttons-centered">
                    <simple-button :disabled="$store.getters.selectedDatasets.some(el => el.getProgress() !== 1)" label="Update" glyphicon="repeat" type="primary" @click="reprocess()"></simple-button>
                </div>
                <hr>
                <span v-if="!this.$store.getters.activeDataset">No dataset is selected... Wait for at least one dataset to be loaded or select one.</span>
                <span v-else>
                    We managed to match {{ this.$store.getters.activeDataset.getDataset().getNumberOfMatchedPeptides() }} of your {{ this.$store.getters.activeDataset.getAmountOfPeptides() }} peptides.
                    Unfortunately, <a style="cursor: pointer;" @click="notFoundPeptidesModalActive = true">{{ this.$store.getters.activeDataset.getDataset().getNumberOfSearchedForPeptides() - this.$store.getters.activeDataset.getDataset().getNumberOfMatchedPeptides() }}</a> peptides couldn't be found.
                </span>

            </card-body>
        </card>
        <modal :active="notFoundPeptidesModalActive">
            <template slot="header" v-if="this.$store.getters.activeDataset">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true" @click="notFoundPeptidesModalActive = false">×</button>
                <h4 class="modal-title">{{ this.$store.getters.activeDataset.getDataset().getNumberOfSearchedForPeptides() - this.$store.getters.activeDataset.getDataset().getNumberOfMatchedPeptides() }} Missed peptides</h4>
            </template>
            <template slot="body" v-if="this.$store.getters.activeDataset">
                <div class="card-supporting-text">
                    <simple-button class="pull-right copy-button" type="default" label="Copy to clipboard" glyphicon="copy" tooltip="Copy list to clipboard" v-clipboard:copy="this.$store.getters.activeDataset.getDataset().getMissedPeptides().join('\n')"></simple-button>
                    Sorry, we didn't manage to find {{ this.$store.getters.activeDataset.getDataset().getNumberOfSearchedForPeptides() - this.$store.getters.activeDataset.getDataset().getNumberOfMatchedPeptides() }} of your peptides. You can BLAST them by clicking the links or copy them by
                    using the button on the right.
                </div>
                <ul>
                    <li v-for="missedPeptide of this.$store.getters.activeDataset.getDataset().getMissedPeptides()">
                        <a target="_blank" :href="`http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&SET_SAVED_SEARCH=on&USER_FORMAT_DEFAULTS=on&PAGE=Proteins&PROGRAM=blastp&QUERY=${missedPeptide}&GAPCOSTS=11%201&EQ_MENU=Enter%20organism%20name%20or%20id--completions%20will%20be%20suggested&DATABASE=nr&BLAST_PROGRAMS=blastp&MAX_NUM_SEQ=100&SHORT_QUERY_ADJUST=on&EXPECT=10&WORD_SIZE=3&MATRIX_NAME=BLOSUM62&COMPOSITION_BASED_STATISTICS=2&SHOW_OVERVIEW=on&SHOW_LINKOUT=on&ALIGNMENT_VIEW=Pairwise&MASK_CHAR=2&MASK_COLOR=1&GET_SEQUENCE=on&NEW_VIEW=on&NUM_OVERVIEW=100&DESCRIPTIONS=100&ALIGNMENTS=100&FORMAT_OBJECT=Alignment&FORMAT_TYPE=HTML&OLD_BLAST=false`">{{ missedPeptide }}</a>
                        <span class="glyphicon glyphicon-share-alt"></span>
                    </li>
                </ul>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Card from "../../components/card/card.vue";
    import SearchSettingsForm from "./search-settings-form.vue";
    import SimpleButton from "../../components/button/simple-button.vue";
    import CardHeader from "../../components/card/card-header.vue";
    import CardTitle from "../../components/card/card-title.vue";
    import CardBody from "../../components/card/card-body.vue";
    import SearchSettings from "../SearchSettings";
    import Modal from "../../components/modal/modal.vue";
    import {addCopy} from "../../utils";

    @Component({
        components: {Modal, CardBody, CardTitle, CardHeader, SimpleButton, SearchSettingsForm, Card}
    })
    export default class ExperimentSummaryCard extends Vue {
        equateIl: boolean = true;
        filterDuplicates: boolean = true;
        missingCleavage: boolean = false;

        notFoundPeptidesModalActive: boolean = false;

        created() {
            this.equateIl = this.$store.getters.searchSettings.isEquateIl();
            this.filterDuplicates = this.$store.getters.searchSettings.isFilterDuplicates();
            this.missingCleavage = this.$store.getters.searchSettings.isHandleMissingCleavage();
        }

        reprocess(): void {
            this.$store.dispatch('setSearchSettings', new SearchSettings(this.equateIl, this.filterDuplicates, this.missingCleavage));

            this.$store.dispatch('setActiveDataset', null);
            for (let dataset of this.$store.getters.selectedDatasets) {
                this.$store.dispatch('processDataset', dataset);
            }
        }
    }
</script>

<style scoped>

</style>

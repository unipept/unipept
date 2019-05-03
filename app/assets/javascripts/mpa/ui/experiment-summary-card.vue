<template>
    <div style="height: 100%;">
        <card style="margin-bottom: 0">
            <card-header>
                <card-title>Experiment summary</card-title>
            </card-header>
            <card-body>
                <search-settings-form
                        :disabled="$store.getters.selectedDatasets.some(el => el.progress !== 1)"
                        :equate-il="equateIl"
                        v-on:equate-il-change="equateIl = $event"
                        :filter-duplicates="filterDuplicates"
                        v-on:filter-duplicates-change="filterDuplicates = $event"
                        :missing-cleavage="missingCleavage"
                        v-on:missing-cleavage="missingCleavage = $event"
                ></search-settings-form>
                <div class="search-buttons-centered">
                    <simple-button :disabled="$store.getters.selectedDatasets.some(el => el.progress !== 1)" label="Update" glyphicon="repeat" type="primary" @click="reprocess()"></simple-button>
                </div>
                <hr>
                <span v-if="!this.$store.getters.activeDataset">No dataset is selected... Wait for at least one dataset to be loaded or select one.</span>
                <span v-else>
                    We managed to match {{ this.$store.getters.activeDataset.getDataset().getNumberOfMatchedPeptides() }} of your {{ this.$store.getters.activeDataset.getAmountOfPeptides() }} peptides.
                    Unfortunately, <a style="cursor: pointer;" @click="showNotFoundPeptidesModal">{{ this.$store.getters.activeDataset.getDataset().getNumberOfSearchedForPeptides() - this.$store.getters.activeDataset.getDataset().getNumberOfMatchedPeptides() }}</a> peptides couldn't be found.
                </span>

            </card-body>
        </card>
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
    import {showInfoModal} from "../../modal";

    @Component({
        components: {Modal, CardBody, CardTitle, CardHeader, SimpleButton, SearchSettingsForm, Card}
    })
    export default class ExperimentSummaryCard extends Vue {
        equateIl: boolean = true;
        filterDuplicates: boolean = true;
        missingCleavage: boolean = false;

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

        showNotFoundPeptidesModal() {
            let missedPeptidesHTML = '';
            for (let missedPeptide of this.$store.getters.activeDataset.getDataset().getMissedPeptides()) {
                missedPeptidesHTML += `
                    <li>
                        <a target="_blank" href="http://blast.ncbi.nlm.nih.gov/Blast.cgi?PAGE_TYPE=BlastSearch&SET_SAVED_SEARCH=on&USER_FORMAT_DEFAULTS=on&PAGE=Proteins&PROGRAM=blastp&QUERY=${missedPeptide}&GAPCOSTS=11%201&EQ_MENU=Enter%20organism%20name%20or%20id--completions%20will%20be%20suggested&DATABASE=nr&BLAST_PROGRAMS=blastp&MAX_NUM_SEQ=100&SHORT_QUERY_ADJUST=on&EXPECT=10&WORD_SIZE=3&MATRIX_NAME=BLOSUM62&COMPOSITION_BASED_STATISTICS=2&SHOW_OVERVIEW=on&SHOW_LINKOUT=on&ALIGNMENT_VIEW=Pairwise&MASK_CHAR=2&MASK_COLOR=1&GET_SEQUENCE=on&NEW_VIEW=on&NUM_OVERVIEW=100&DESCRIPTIONS=100&ALIGNMENTS=100&FORMAT_OBJECT=Alignment&FORMAT_TYPE=HTML&OLD_BLAST=false">${missedPeptide}</a>
                        <span class="glyphicon glyphicon-share-alt"></span>
                    </li>
                `;
            }

            let missedPeptidesCount = this.$store.getters.activeDataset.getDataset().getNumberOfSearchedForPeptides() - this.$store.getters.activeDataset.getDataset().getNumberOfMatchedPeptides();

            let modalContent = `
                <div class="card-supporting-text">
                    <button class="btn btn-default pull-right copy-button"><span class="glyphicon glyphicon-copy"></span></button>
                    Sorry, we didn't manage to find ${missedPeptidesCount} of your peptides. You can BLAST them by clicking the links or copy them by using the button on the right.
                </div>
                <ul>
                    ${missedPeptidesHTML}
                </ul>
            `;

            let modal = showInfoModal(missedPeptidesCount + ' missed peptides', modalContent);
            console.log(modal);
            addCopy($(".copy-button")[0], () => this.$store.getters.activeDataset.getDataset().getMissedPeptides().join('\n'), "Copy list to clipboard", modal[0]);
        }
    }
</script>

<style scoped>

</style>

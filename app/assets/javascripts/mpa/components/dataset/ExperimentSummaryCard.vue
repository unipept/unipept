<docs>
The ExperimentSummaryCard summarizes an experiment into statistics: mainly the amount of peptides that were found, the
peptides that were not found (including the ability to show these as a list). This component also allows the user to
change the currently active search settings and redo the analysis of all selected assays.
</docs>

<template>
    <v-card style="min-height: 100%; display: flex; flex-direction: column;">
        <card-header>
            <card-title>
                {{ assayName }}
            </card-title>
        </card-header>
        <v-card-text style="flex-grow: 1; display: flex; flex-direction: column;">
            <div class="subtitle-1">Peptide list</div>
            <v-textarea :readonly="true" v-model="peptideList" :loading="disabled || exportLoading"></v-textarea>
            <div class="subtitle-1">Search settings</div>
            <search-settings-form
                :disabled="disabled"
                :equate-il.sync="equateIl"
                :filter-duplicates.sync="filterDuplicates"
                :missing-cleavage.sync="missingCleavage"
                :horizontal="false"
                style="flex-grow: 1;">
            </search-settings-form>
            <div class="card-actions" v-if="">
                <tooltip message="Restart search with selected samples using the settings chosen above.">
                    <v-btn :disabled="disabled || exportLoading || !isDirty" @click="reprocess()" color="primary">
                        <v-icon left>
                            mdi-restore
                        </v-icon>
                        Update
                    </v-btn>
                </tooltip>
                <export-results-button :assay="activeAssay"></export-results-button>
            </div>
            <v-divider></v-divider>
            <span v-if="!activeAssay || !peptideTrust" class="dataset-placeholder-text">
                No dataset is selected... Wait for at least one dataset to be loaded or select one.
            </span>
            <span v-else class="peptide-match-text">
                We managed to match {{ peptideTrust.matchedPeptides }} of your {{ peptideTrust.searchedPeptides }}
                peptides. Unfortunately,
                <a style="cursor: pointer;" @click="showNotFoundPeptidesModal">
                    {{ peptideTrust.missedPeptides.length }}
                </a>
                peptides couldn't be found.
            </span>
        </v-card-text>
        <v-dialog v-model="showNotFoundModal" :width="600">
            <v-card v-if="peptideTrust">
                <v-card-title>
                    {{ peptideTrust.missedPeptides.length }} missed peptides
                </v-card-title>
                <v-card-text>
                    <missing-peptides-list :missed-peptides="peptideTrust.missedPeptides">
                    </missing-peptides-list>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import {
    SearchSettingsForm,
    CardHeader,
    CardTitle,
    MissingPeptidesList,
    Tooltip,
    ProteomicsAssay,
    PeptideTrust,
    PeptideCountTableProcessor,
    SearchConfiguration,
    Peptide,
    CountTable,
    CommunicationSource,
    ExportResultsButton
} from "unipept-web-components";

@Component({
    components: { ExportResultsButton, CardTitle, CardHeader, SearchSettingsForm, Tooltip, MissingPeptidesList },
    computed: {
        peptideList: {
            get() {
                if (this.activeAssay) {
                    return this.activeAssay.getPeptides().join("\n");
                } else {
                    return "";
                }
            },
            set() {
                // Do nothing (should never be triggered as textarea is readonly)
            }
        },
        assayName: {
            get() {
                if (this.activeAssay) {
                    return this.activeAssay.getName();
                } else {
                    return "Experiment Summary";
                }
            }
        },
        // Did the data change without updating?
        isDirty: {
            get(): boolean {
                return this.equateIl != this.searchConfiguration.equateIl ||
                        this.filterDuplicates != this.searchConfiguration.filterDuplicates ||
                        this.missingCleavage != this.searchConfiguration.enableMissingCleavageHandling;
            }
        }
    }
})
export default class ExperimentSummaryCard extends Vue {
    /**
     * Is the user able to interact with this component? (True if he can interact, false otherwise).
     */
    @Prop({ required: false, default: false })
    private disabled: boolean;
    /**
     * Denotes the assay that's currently been selected by the user (this is the assay for which the visualizations
     * are visible at this moment).
     */
    @Prop({ required: true })
    private activeAssay: ProteomicsAssay;
    @Prop({ required: true })
    private searchConfiguration: SearchConfiguration;
    @Prop({ required: true })
    private communicationSource: CommunicationSource;

    // Is the export system loading?
    private exportLoading: boolean = false;

    private equateIl: boolean = true;
    private filterDuplicates: boolean = true;
    private missingCleavage: boolean = false;
    private showNotFoundModal: boolean = false;

    private peptideTrust: PeptideTrust = null;
    private peptideCountTable: CountTable<Peptide> = null;

    private loading: boolean = true;

    mounted() {
        this.onSearchConfigurationChanged();
        this.onActiveAssayChanged();
    }

    @Watch("searchConfiguration")
    private onSearchConfigurationChanged() {
        if (this.searchConfiguration) {
            this.equateIl = this.searchConfiguration.equateIl;
            this.filterDuplicates = this.searchConfiguration.filterDuplicates;
            this.missingCleavage = this.searchConfiguration.enableMissingCleavageHandling;
        }
    }

    reprocess(): void {
        /**
         * Fired after the user chose new settings and decided to rerun the analysis on all selected assays.
         */
        this.$emit(
            "update-search-settings",
            new SearchConfiguration(
                this.equateIl,
                this.filterDuplicates,
                this.missingCleavage
            )
        );
    }

    private showNotFoundPeptidesModal() {
        this.showNotFoundModal = true;
    }

    @Watch("activeAssay")
    @Watch("communicationSource")
    @Watch("searchConfiguration")
    private async onActiveAssayChanged(): Promise<void> {
        if (this.activeAssay && this.searchConfiguration && this.communicationSource) {
            this.loading = true;

            const peptideProcessor = new PeptideCountTableProcessor();
            this.peptideCountTable = await peptideProcessor.getPeptideCountTable(
                this.activeAssay.getPeptides(),
                this.searchConfiguration
            );

            this.peptideTrust = await this.communicationSource.getPept2DataCommunicator().getPeptideTrust(
                this.peptideCountTable,
                this.searchConfiguration
            );

            this.loading = false;
        }
    }
}
</script>

<style>
</style>

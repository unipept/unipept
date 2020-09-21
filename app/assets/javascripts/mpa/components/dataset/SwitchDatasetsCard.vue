<docs>
This component does not keep track of which datasets are currently selected itself. This is the responsibility of the
parent component, which should properly react to the events emitted by this component and that allow him to stay up
to date.
</docs>

<template>
    <v-card style="min-height: 100%; display: flex; flex-direction: column;">
         <card-header class="card-title-interactive">
            <card-title>
                Metaproteomics Analysis
            </card-title>
            <div class="card-title-action">
                <tooltip message="Add another assay to the selection.">
                    <v-icon
                        @click="toggleAssaySelection()"
                        color="white">
                        {{ this.isAssaySelectionInProgress ? 'mdi-plus-circle' : 'mdi-plus' }}
                    </v-icon>
                </tooltip>
            </div>
        </card-header>
        <v-card-text v-if="this.$store.getters.assays.length === 0">
            <span>Please add one or more datasets by clicking the plus button above...</span>
        </v-card-text>
        <div class="growing-list">
            <v-list two-line>
                <assay-item
                    v-for="data of this.$store.getters.assays"
                    :assayData="data"
                    :key="data.assay.id">
                </assay-item>
            </v-list>
            <v-card-text>
                <v-divider></v-divider>
                <div class="text-center">
                    <tooltip message="Compare samples above using a heatmap.">
                        <v-btn
                            :disabled="isInProgress"
                            @click="compareAssays">
                            Compare samples
                        </v-btn>
                    </tooltip>
                </div>
            </v-card-text>
        </div>
        <v-dialog v-model="dialogOpen" width="1000px">
            <div style="min-height: 600px; background-color: white;">
                <div class="modal-header" >
                    <button type="button" class="close" @click="dialogOpen = false">
                        <span aria-hidden="true">×</span>
                    </button>
                    <h4 class="modal-title">Heatmap wizard</h4>
                </div>
                <div>
                    <heatmap-wizard-multi-sample
                        v-if="!isInProgress"
                        :assays="this.$store.getters.assays"
                        :tree="tree">
                    </heatmap-wizard-multi-sample>
                    <div v-else style="display: flex; justify-content: center;">
                        <div class="text-xs-center" style="margin-top: 25px;">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </div>
                    </div>
                </div>
            </div>
        </v-dialog>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import {
    CardHeader,
    CardTitle,
    HeatmapWizardMultiSample,
    Tooltip,
    ProteomicsAssay,
    Tree,
    CountTable,
    Peptide,
    LcaCountTableProcessor,
    NcbiOntologyProcessor
} from "unipept-web-components"
import AssayItem from "./AssayItem.vue"

@Component({
    components: { CardTitle, CardHeader, HeatmapWizardMultiSample, Tooltip, AssayItem },
    computed: {}
})
export default class SwitchDatasetsCard extends Vue {
    private isAssaySelectionInProgress: boolean = false;
    private dialogOpen: boolean = false;
    private tree: Tree = null;

    get countTable(): CountTable<Peptide> {
        const activeAssay: ProteomicsAssay = this.$store.getters.activeAssay;
        if (activeAssay) {
            return this.$store.getters.assayData(activeAssay)?.countTable;
        } else {
            return undefined;
        }
    }

    get activeAssay(): ProteomicsAssay {
        return this.$store.getters.getActiveAssay;
    }

    get isInProgress(): boolean {
        return this.$store.getters.assays.some(a => a.analysisMetaData.progress < 1);
    }

    mounted() {}

    @Watch("countTable")
    @Watch("activeAssay")
    private async onCountTableChanged() {
        if (this.activeAssay && this.countTable) {
            const taxaCountProcessor = new LcaCountTableProcessor(this.countTable, this.activeAssay.getSearchConfiguration());
            const taxaCounts = await taxaCountProcessor.getCountTable();

            const taxaOntologyProcessor = new NcbiOntologyProcessor();
            const taxaOntology = await taxaOntologyProcessor.getOntology(taxaCounts);

            this.tree = new Tree(taxaCounts, taxaOntology, await taxaCountProcessor.getAnnotationPeptideMapping(), 1);
        }
    }

    private deselectAssay(dataset: ProteomicsAssay) {
        this.$emit("deselect-assay", dataset);
    }

    private toggleAssaySelection(): void {
        this.isAssaySelectionInProgress = !this.isAssaySelectionInProgress;
        this.$emit("assay-selection-in-progress", this.isAssaySelectionInProgress);
    }

    private compareAssays(): void {
        this.dialogOpen = true;
    }

    /**
     * This function gets called whenever the user changes the currently active assay. The assay dataset is the
     * dataset for which the visualizations are currently shown.
     *
     * @param assay The assay that's currently activated by the user.
     */
    private activateAssay(assay: ProteomicsAssay) {
        if (this.$store.getters.getProgressStatesMap.find(p => p.assay.getId() === assay.getId()).progress === 1) {
            this.$emit("activate-assay", assay)
        }
    }
}
</script>

<style lang="less">
    .growing-list {
        min-height: 100%;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .v-divider {
        margin-top: 15px;
        margin-bottom: 15px;
    }

    .select-dataset-radio .v-input--radio-group__input {
        margin-right: -16px;
    }
</style>

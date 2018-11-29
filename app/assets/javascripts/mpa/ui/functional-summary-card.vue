<template>
    <div>
        <modal :active="sortSettingsModalActive">
            <template slot="header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true" @click="sortSettingsModalActive = false">×</button>
                <h4 class="modal-title">Sorting functional annotations</h4>
            </template>
            <template slot="body">
                <p>The functional annotations can be sorted on two metrics:</p>
                <ul>
                    <li><strong>Peptides</strong>: The absolute number of peptides that are associated with a given functional annotation.</li>
                    <li><strong>Peptides%</strong>: Like peptides, but the reported value is represented as a percentage indicating the fraction of the total number of peptides.</li>
                </ul>
                <p>
                    Your "Filter duplicate peptides" setting is taken into account. If it is enabled, peptides that occur multiple times
                    in your input list are counted that many times.
                </p>
            </template>
        </modal>

        <card-nav>
            <template slot="interactiveTitle">
                <div class="dropdown pull-right">
                    <button class="btn btn-default dropdown-toggle" type="button" id="mpa-select-fa-sort" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span class="glyphicon glyphicon-sort-by-attributes-alt pull-left"></span><span id="mpa-select-fa-sort-name">{{ faSortSettings.name}}</span>
                        <span class="caret"></span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-right" id="mpa-select-fa-sort-items" aria-labelledby="mpa-selet-fa-sort">
                        <li class="dropdown-header">Sort by number of peptides in related proteins
                            <span class="small glyphicon glyphicon-question-sign btn-icon" @click="sortSettingsModalActive = true"></span>
                        </li>
                        <li>
                            <a :class="formatType === 'percent' ? 'active' : ''" @click="setFormatSettings('percent', 'fractionOfPepts', 'fractionOfPepts', 'Peptides %')">Peptides %</a>
                        </li>
                        <li>
                            <a :class="formatType === 'int' ? 'active' : ''" @click="setFormatSettings('int', 'numberOfPepts', 'fractionOfPepts', 'Peptides')">Peptides</a>
                        </li>
                    </ul>
                </div>
            </template>

            <template slot="sharedContent">
                <div id="fa-filter-warning" class="card-supporting-text" v-if="watchableSelectedTaxonId !== -1">
                    <strong>Filtered results:</strong> These results are limited to the {{ numOfFilteredPepts }} specific to <strong>{{ filteredScope}}</strong>
                    <simple-button id="fa-undo-filter" label="Undo" @click="reset()"></simple-button>
                </div>
                <indeterminate-progress-bar :active="faCalculationsInProgress"></indeterminate-progress-bar>
            </template>

            <tab label="GO terms" :active="true">
                <filter-functional-annotations-dropdown v-model="percentSettings"></filter-functional-annotations-dropdown>
                This panel shows the Gene Ontology annotations that were matched to
                your peptides. <span v-if="fa && $store.getters.activeDataset" v-html="this.trustLine(fa, 'GO term')"></span>Click on a row in a table to see a taxonomy tree that highlights occurrences.
                <div v-if="!$store.getters.activeDataset" class="mpa-unavailable go">
                    <h3>Biological Process</h3>
                    <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                    <h3>Cellular Component</h3>
                    <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                    <h3>Molecular Function</h3>
                    <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                </div>
                <div v-else v-for="variant in namespaces">
                    <go-terms-summary :sort-settings="faSortSettings" :fa="fa" :namespace="variant" :peptide-container="$store.getters.activeDataset"></go-terms-summary>
                </div>
            </tab>
            <tab label="EC numbers">
                <filter-functional-annotations-dropdown v-model="percentSettings"></filter-functional-annotations-dropdown>
                This panel shows the Enzyme Commission numbers that were matched to your peptides. <span v-if="fa && $store.getters.activeDataset" v-html="this.trustLine(fa, 'EC number')"></span>Click on a row in a table to see a taxonomy tree that highlights occurrences.
                <ec-numbers-summary style="margin-top: 10px" v-if="$store.getters.activeDataset" :fa="fa" :peptide-container="$store.getters.activeDataset" :sort-settings="faSortSettings"></ec-numbers-summary>
                <div v-else style="margin-top: 10px;">
                    <span style="font-weight: 600;">Please wait while we are preparing your data...</span>
                    <hr>
                    <img src="/images/mpa/placeholder_treeview.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                </div>
            </tab>
        </card-nav>
        <!-- TODO When the AmountTable is converted to Vue, this should be automatically managed! -->
        <div id="tooltip" class="tip"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import CardNav from "../../components/card/card-nav.vue";
    import Tab from "../../components/card/tab.vue";
    import GoTermsSummary from "./tables/go-terms-summary.vue";
    import MpaAnalysisManager from "../MpaAnalysisManager";
    import FaSortSettings from "./tables/FaSortSettings";
    import {numberToPercent} from "../../utils";
    import {Dataset} from "../dataset";
    import NewPeptideContainer from "../NewPeptideContainer";
    import {FunctionalAnnotations} from "../../fa/FunctionalAnnotations";
    import EcNumbersSummary from "./tables/ec-numbers-summary.vue";
    import Modal from "../../components/modal/modal.vue";
    import SimpleButton from "../../components/button/simple-button.vue";
    import FilterFunctionalAnnotationsDropdown from "./filter-functional-annotations-dropdown.vue";
    import IndeterminateProgressBar from "../../components/progress/indeterminate-progress-bar.vue";

    @Component({
        components: {
            IndeterminateProgressBar,
            FilterFunctionalAnnotationsDropdown,
            SimpleButton, EcNumbersSummary, GoTermsSummary, Tab, CardNav, Modal},
        computed: {
            watchableDataset: {
                get(): NewPeptideContainer {
                    return this.$store.getters.activeDataset
                }
            },
            watchableSelectedSearchTerm: {
                get(): string {
                    return this.$store.getters.selectedTerm
                }
            },
            watchableSelectedTaxonId: {
                get(): string {
                    return this.$store.getters.selectedTaxonId;
                }
            }
        }
    })
    export default class FunctionalSummaryCard extends Vue {
        namespaces: string[] = MpaAnalysisManager.GO_NAMESPACES;

        private formatType: string = "int";
        private fieldType: string = "numberOfPepts";
        private shadeFieldType: string = "fractionOfPepts";
        private name: string = "Peptides";

        private readonly formatters = {
            "int": x => x.toString(),
            "percent": x => numberToPercent(x),
            "2pos": x => x.toFixed(2).toString(),
        };

        faSortSettings: FaSortSettings = new FaSortSettings(
            (x: string) => this.formatters[this.formatType](x[this.fieldType]),
            (x: string) => this.formatters[this.formatType](x),
            this.fieldType,
            this.shadeFieldType,
            this.name,
            (a, b) => b[this.fieldType] - a[this.fieldType]
        );

        percentSettings: string = "5";

        fa: FunctionalAnnotations | null = null;

        sortSettingsModalActive: boolean = false;

        filteredScope: string = "";
        numOfFilteredPepts: string = "";
        faCalculationsInProgress: boolean = false;

        @Watch('watchableDataset') onWatchableDatasetChanged() {
            this.onPeptideContainerChanged();
        }

        @Watch('percentSettings') onPercentSettingsChanged() {
            this.onPeptideContainerChanged();
        }

        @Watch('watchableSelectedSearchTerm') onWatchableSelectedSearchTermChanged() {
            this.onPeptideContainerChanged();
        }

        @Watch('watchableSelectedTaxonId') onWatchableSelectedTaxonIdChanged() {
            this.onPeptideContainerChanged();
        }

        setFormatSettings(formatType: string, fieldType: string, shadeFieldType: string, name: string): void {
            this.formatType = formatType;

            this.faSortSettings.format = (x:string) => this.formatters[this.formatType](x[fieldType]);
            this.faSortSettings.formatData = (x:string) => this.formatters[this.formatType](x);
            this.faSortSettings.field = fieldType;
            this.faSortSettings.shadeField = shadeFieldType;
            this.faSortSettings.name = name;
            this.faSortSettings.sortFunc = (a, b) => b[fieldType] - a[fieldType];

            // Recalculate stuff
            this.onPeptideContainerChanged();
        }

        reset() {
            this.$store.dispatch('setSelectedTerm', 'Organism');
            this.$store.dispatch('setSelectedTaxonId', -1);
        }

        private async onPeptideContainerChanged() {
            this.faCalculationsInProgress = true;
            let container: NewPeptideContainer = this.$store.getters.activeDataset;
            if (container && container.getDataset()) {
                await this.redoFAcalculations();
                this.fa = this.$store.getters.activeDataset.getDataset().fa;
            }
            this.faCalculationsInProgress = false;
        }

        private async redoFAcalculations(): Promise<void> {
            let peptideContainer = this.$store.getters.activeDataset;

            if (peptideContainer && peptideContainer.getDataset()) {
                let dataset: Dataset = peptideContainer.getDataset();

                const percent = parseInt(this.percentSettings);
                let sequences = null;

                let taxonId = this.$store.getters.selectedTaxonId;

                if (taxonId > 0) {
                    sequences = dataset.tree.getAllSequences(taxonId);
                    let taxonData = dataset.tree.nodes.get(taxonId);
                    this.filteredScope = `${taxonData.name} (${taxonData.rank})`;
                }

                await dataset.reprocessFA(percent, sequences);
                if (dataset.baseFa === null) {
                    dataset.setBaseFA();
                }

                const num = dataset.fa.getTrust().totalCount;
                this.numOfFilteredPepts = `${num} peptide${num === 1 ? "" : "s"}`;
            }
        }

        /**
         * Creates a line indicating the trust of the function annotations
         * @param {FunctionalAnnotations} fa
         * @param {String} kind Human readable word that fits in "To have at least one … assigned to it"
         * @return {string}
         */
        private trustLine(fa, kind) {
            const trust = fa.getTrust();
            if (trust.annotatedCount === 0) {
                return `<strong>No peptide</strong> has a ${kind} assigned to it. `;
            }
            if (trust.annotatedCount === trust.totalCount) {
                return `<strong>All peptides</strong> ${trust.annotatedCount <= 5 ? `(only ${trust.annotatedCount})` : ""} have at least one ${kind} assigned to them. `;
            }
            if (trust.annotatedCount === 1) {
                return `Only <strong>one peptide</strong> (${numberToPercent(trust.annotaionAmount)}) has at least one ${kind} assigned to it. `;
            }
            return `<strong>${trust.annotatedCount} peptides</strong> (${numberToPercent(trust.annotaionAmount)}) have at least one ${kind} assigned to them. `;
        }
    }
</script>

<style scoped>

</style>

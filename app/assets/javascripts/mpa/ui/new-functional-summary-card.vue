<template>
    <div>
        <card-nav>
            <card-header class="card-title-interactive">
                <ul class="nav nav-tabs">
                    <li v-for="tab in tabs" v-bind:class="{ active: tab.activated }" @click="changeActiveTab(tab)" v-bind:key="tab.id">
                        <a>{{ tab.label }}</a>
                    </li>
                </ul>
                <div class="nav-right">
                    <div class="dropdown pull-right">
                        <button class="btn btn-default dropdown-toggle" type="button" id="mpa-select-fa-sort" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span class="glyphicon glyphicon-sort-by-attributes-alt pull-left"></span><span id="mpa-select-fa-sort-name">{{ faSortSettings.name }}</span>
                            <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-right" id="mpa-select-fa-sort-items" aria-labelledby="mpa-select-fa-sort">
                            <li class="dropdown-header">Sort by number of peptides in related proteins
                                <span class="small glyphicon glyphicon-question-sign btn-icon" @click="showSortSettingsModal"></span>
                            </li>
                            <li>
                                <a :class="formatType === 'percent' ? 'active' : ''" @click="setFormatSettings('percent', 'fractionOfPepts', 'fractionOfPepts', 'Peptides %')">Peptides %</a>
                            </li>
                            <li>
                                <a :class="formatType === 'int' ? 'active' : ''" @click="setFormatSettings('int', 'popularity', 'fractionOfPepts', 'Peptides')">Peptides</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </card-header>

            <div id="fa-filter-warning" class="card-supporting-text" v-if="watchableSelectedTaxonId !== -1">
                <strong>Filtered results:</strong> These results are limited to the {{ numOfFilteredPepts }} specific to <strong>{{ filteredScope}}</strong>
                <simple-button id="fa-undo-filter" label="Undo" @click="reset()"></simple-button>
            </div>
            <indeterminate-progress-bar :active="faCalculationsInProgress"></indeterminate-progress-bar>

            <card-body>
                <div class="tab-content">
                    <tab label="GO terms" :active="true">
                        <!-- <filter-functional-annotations-dropdown v-model="percentSettings"></filter-functional-annotations-dropdown> -->
                        This panel shows the Gene Ontology annotations that were matched to
                        your peptides. <span v-if="$store.getters.activeDataset && $store.getters.activeDataset.progress === 1" v-html="this.trustLine('GO term')"></span>Click on a row in a table to see a taxonomy tree that highlights occurrences.
                        <div v-if="!$store.getters.activeDataset || $store.getters.activeDataset.progress !== 1" class="mpa-unavailable go">
                            <h3>Biological Process</h3>
                            <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                            <h3>Cellular Component</h3>
                            <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                            <h3>Molecular Function</h3>
                            <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                        </div>
                        <div v-else>
                            <div class="row" v-for="(namespace, idx) of goNamespaces" v-bind:key="namespace">
                                <h3>{{ goData[idx].title }}</h3>
                                <div class="col-xs-8">
                                    <go-amount-table :items="goData[idx].goTerms"></go-amount-table>
                                </div>
                                <div class="col-xs-4">
                                    <img :src="getQuickGoSmallUrl(goNamespaces[0])" class="quickGoThumb" @click="showGoModal(goNamespaces[0])">
                                </div>
                            </div>
                        </div>
                    </tab>
                    <tab label="EC numbers">
                        <!-- <filter-functional-annotations-dropdown v-model="percentSettings"></filter-functional-annotations-dropdown>
                        This panel shows the Enzyme Commission numbers that were matched to your peptides. <span v-if="fa && $store.getters.activeDataset" v-html="this.trustLine(fa, 'EC number')"></span>Click on a row in a table to see a taxonomy tree that highlights occurrences.
                        <ec-numbers-summary style="margin-top: 10px" v-if="$store.getters.activeDataset && $store.getters.activeDataset.getProgress() === 1" :fa="fa" :peptide-container="$store.getters.activeDataset" :sort-settings="faSortSettings"></ec-numbers-summary>
                        <div v-else style="margin-top: 10px;">
                            <span style="font-weight: 600;">Please wait while we are preparing your data...</span>
                            <hr>
                            <img src="/images/mpa/placeholder_treeview.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                        </div> -->
                    </tab>
                </div>
            </card-body>
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
    import {numberToPercent, stringTitleize} from "../../utils";
    import PeptideContainer from "../PeptideContainer";
    import {FunctionalAnnotations} from "../../fa/FunctionalAnnotations";
    import EcNumbersSummary from "./tables/ec-numbers-summary.vue";
    import SimpleButton from "../../components/button/simple-button.vue";
    import FilterFunctionalAnnotationsDropdown from "./filter-functional-annotations-dropdown.vue";
    import IndeterminateProgressBar from "../../components/progress/indeterminate-progress-bar.vue";
    import CardHeader from "../../components/card/card-header.vue";
    import CardBody from "../../components/card/card-body.vue";
    import {showInfoModal} from "../../modal";
    import Sample from "../Sample";
    import GoDataSource from "../datasource/GoDataSource";
    import { GoNameSpace } from "../../fa/GoNameSpace";
    import GoTerm from "../../fa/GoTerm";
    import GoAmountTable from "./tables/go-amount-table.vue";
    import TaxaDataSource from "../datasource/TaxaDataSource";

    @Component({
        components: {
            CardBody,
            CardHeader,
            IndeterminateProgressBar,
            FilterFunctionalAnnotationsDropdown,
            SimpleButton, EcNumbersSummary, GoTermsSummary, Tab, CardNav, GoAmountTable},
        computed: {
            watchableDataset: {
                get(): PeptideContainer {
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
    export default class NewFunctionalSummaryCard extends Vue {
        tabs: Tab[] = [];

        private formatType: string = "int";
        private fieldType: string = "numberOfPepts";
        private shadeFieldType: string = "fractionOfPepts";
        private name: string = "Peptides";

        // We need to define all namespaces as a list here, as Vue templates cannot access the GoNameSpace class 
        // directly
        private goNamespaces: GoNameSpace[] = Object.values(GoNameSpace).sort();
        private goData: {goTerms: GoTerm[], title: string}[] = [];

        private readonly formatters = {
            "int": x => x.toString(),
            "percent": x => numberToPercent(x),
            "2pos": x => x.toFixed(2).toString(),
        };

        private faSortSettings: FaSortSettings = new FaSortSettings(
            (x: GoTerm) => this.formatters[this.formatType](x[this.fieldType]),
            this.fieldType,
            this.shadeFieldType,
            this.name,
            (a, b) => b[this.fieldType] - a[this.fieldType]
        );

        private percentSettings: string = "5";

        private filteredScope: string = "";
        private numOfFilteredPepts: string = "";
        private faCalculationsInProgress: boolean = false;

        mounted() {
            this.tabs = this.$children[0].$children[2].$children as Tab[];
            for (let ns of this.goNamespaces) {
                this.goData.push({
                    goTerms: [],
                    title: stringTitleize(ns.toString())
                });
            }
        }

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

        changeActiveTab(tab: Tab) {
            for (let currentTab of this.tabs) {
                currentTab.activated = false;
            }

            tab.activated = true;
        }

        setFormatSettings(formatType: string, fieldType: string, shadeFieldType: string, name: string): void {
            this.formatType = formatType;

            this.faSortSettings.format = (x: GoTerm) => this.formatters[this.formatType](x[fieldType]);
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

        showSortSettingsModal() {
            let modalContent = `
                <p>The functional annotations can be sorted on two metrics:</p>
                <ul>
                    <li><strong>Peptides</strong>: The absolute number of peptides that are associated with a given functional annotation.</li>
                    <li><strong>Peptides%</strong>: Like peptides, but the reported value is represented as a percentage indicating the fraction of the total number of peptides.</li>
                </ul>
                <p>
                    Your "Filter duplicate peptides" setting is taken into account. If it is enabled, peptides that occur multiple times
                    in your input list are counted that many times.
                </p>
            `;

            showInfoModal("Sorting functional annotations", modalContent);
        }

        private getQuickGoSmallUrl(ns: GoNameSpace): string {
            let goTerms: GoTerm[] = this.goData[this.goNamespaces.indexOf(ns)].goTerms;
            // TODO reorder when using different sort function when chosen
            const top5: string[] = goTerms.slice(0, 5).map(x => x.code);

            if (top5.length > 0) {
                return this.quickGOChartURL(top5, false);
            }
            return null;
        }

        private showGoModal(ns: GoNameSpace): void {
            let goTerms: GoTerm[] = this.goData[this.goNamespaces.indexOf(ns)].goTerms;
            // TODO reorder when using different sort function when chosen
            const top5: GoTerm[] = goTerms.slice(0, 5);

            if (top5.length > 0) {
                const top5WithNames = top5.map(x => `${x.name} (${this.faSortSettings.format(x)})`);
                const top5Sentence = top5WithNames.slice(0, -1).join(", ")
                    + (top5.length > 1 ? " and " : "")
                    + top5WithNames[top5WithNames.length - 1];
                const quickGoChartSmallUrl: string = this.quickGOChartURL(top5, false);
                const quickGoChartURL: string = this.quickGOChartURL(top5, true);
                
                let modalContent = `
                    This chart shows the relationship between the ${top5.length} most occurring GO terms: ${top5Sentence}.
                    <br/>
                    <a href="${quickGoChartURL}" target="_blank" title="Click to enlarge in new tab">
                        <img style="max-width: 100%;" src="${quickGoChartSmallUrl}" alt="QuickGO chart of ${top5Sentence}"/>
                    </a>
                    <div>
                        Provided by <a href="https://www.ebi.ac.uk/QuickGO/annotations?goId=${top5.join(',')}" target="_blank">QuickGO</a>.
                    </div>
                `;

                showInfoModal("QuickGo " + ns, modalContent);
            }
        }

        /**
         * @param {string[]} terms the terms to show in the chart (at least one)
         * @param {boolean} showKey Show the legend of the colors
         * @return {string} The QuickGo chart URL of the given GO terms
         */
        private quickGOChartURL(terms, showKey = true): string {
            // sort the terms to improve caching
            return `https://www.ebi.ac.uk/QuickGO/services/ontology/go/terms/${terms.sort().join(",")}/chart?showKey=${showKey}`;
        }

        private async onPeptideContainerChanged() {
            this.faCalculationsInProgress = true;
            let container: PeptideContainer = this.$store.getters.activeDataset;
            if (container && container.getDataset()) {
                await this.redoFAcalculations();
            }
            this.faCalculationsInProgress = false;
        }

        private async redoFAcalculations(): Promise<void> {
            let peptideContainer = this.$store.getters.activeDataset;

            if (peptideContainer && peptideContainer.getDataset()) {
                let sample: Sample = peptideContainer.getDataset();
                let goSource: GoDataSource = await sample.dataRepository.createGoDataSource();
                let taxaSource: TaxaDataSource = await sample.dataRepository.createTaxaDataSource();

                const percent = parseInt(this.percentSettings);
                const taxonId = this.$store.getters.selectedTaxonId;

                let sequences = null;
                if (taxonId > 0) {
                    let tree = await taxaSource.getTree();
                    sequences = tree.getAllSequences(taxonId);
                    let taxonData = tree.nodes.get(taxonId);
                    this.filteredScope = `${taxonData.name} (${taxonData.rank})`;
                }

                for (let i = 0; i < this.goNamespaces.length; i++) {
                    let namespace: GoNameSpace = this.goNamespaces[i];
                    this.goData[i].goTerms = await goSource.getGoTerms(namespace, percent, sequences);
                }
            }
        }

        /**
         * TODO replace with new code!
         * Creates a line indicating the trust of the function annotations
         * @param {FunctionalAnnotations} fa
         * @param {String} kind Human readable word that fits in "To have at least one … assigned to it"
         * @return {string}
         */
        private trustLine(kind) {
            // TODO fix and implement!
            return "";
            // const trust = fa.getTrust();
            // if (trust.annotatedCount === 0) {
            //     return `<strong>No peptide</strong> has a ${kind} assigned to it. `;
            // }
            // if (trust.annotatedCount === trust.totalCount) {
            //     return `<strong>All peptides</strong> ${trust.annotatedCount <= 5 ? `(only ${trust.annotatedCount})` : ""} have at least one ${kind} assigned to them. `;
            // }
            // if (trust.annotatedCount === 1) {
            //     return `Only <strong>one peptide</strong> (${numberToPercent(trust.annotaionAmount)}) has at least one ${kind} assigned to it. `;
            // }
            // return `<strong>${trust.annotatedCount} peptides</strong> (${numberToPercent(trust.annotaionAmount)}) have at least one ${kind} assigned to them. `;
        }
    }
</script>

<style scoped>

</style>

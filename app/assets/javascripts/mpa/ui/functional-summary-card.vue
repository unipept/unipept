<template>
    <div>
        <v-card>
            <v-tabs color="primary" dark v-model="currentTab">
                <v-tab>
                    GO Terms
                </v-tab>
                <v-tab>
                    EC Numbers
                </v-tab>
                <v-spacer>
                </v-spacer>
                <v-menu bottom left>
                    <template v-slot:activator="{ on }">
                        <v-btn text class="align-self-center mr-4" v-on="on">
                            <v-icon left>mdi-sort-descending</v-icon>
                            {{ faSortSettings.name }}
                            <v-icon right>arrow_drop_down</v-icon>
                        </v-btn>
                    </template>

                    <v-list class="grey lighten-3">
                        <v-list-tile class="menu-header" @click="showSortSettingsModal()">
                            <v-list-tile-title>
                                Sort by number of peptides in related proteins
                                <v-icon right>mdi-help-circle</v-icon>
                            </v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile @click="setFormatSettings('percent', 'fractionOfPepts', 'fractionOfPepts', 'Peptides %')">
                            <v-list-tile-title>
                                Peptides %
                            </v-list-tile-title>
                            
                        </v-list-tile>
                        <v-list-tile @click="setFormatSettings('int', 'popularity', 'fractionOfPepts', 'Peptides')">
                            <v-list-tile-title>
                                Peptides
                            </v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>
            </v-tabs>
            <v-tabs-items v-model="currentTab">
                <v-tab-item>
                    <v-card flat>
                        <v-card-text>
                            <div v-if="!$store.getters.activeDataset || $store.getters.activeDataset.progress !== 1" class="mpa-unavailable go">
                                <h3>Biological Process</h3>
                                <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                                <h3>Cellular Component</h3>
                                <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                                <h3>Molecular Function</h3>
                                <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                            </div>
                            <div v-else>
                                <filter-functional-annotations-dropdown v-model="percentSettings"></filter-functional-annotations-dropdown>
                                This panel shows the Gene Ontology annotations that were matched to
                                your peptides.
                                <span v-html="goTrustLine"></span>Click on a row in a table to see a taxonomy tree that highlights occurrences.
                                <div class="row" v-for="(namespace, idx) of goNamespaces" v-bind:key="namespace">
                                    <h3 style="padding-left: 16px;">{{ goData[idx].title }}</h3>
                                    <div class="col-xs-8">
                                        <go-amount-table :items="goData[idx].goTerms" :namespace="namespace" :searchSettings="faSortSettings"></go-amount-table>
                                    </div>
                                    <div class="col-xs-4">
                                        <img :src="getQuickGoSmallUrl(goNamespaces[idx])" class="quickGoThumb" @click="showGoModal(goNamespaces[idx])">
                                    </div>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card flat>
                        <v-card-text>
                            <div v-if="!$store.getters.activeDataset || $store.getters.activeDataset.progress !== 1" style="margin-top: 10px;">
                                <span style="font-weight: 600;">Please wait while we are preparing your data...</span>
                                <hr>
                                <img src="/images/mpa/placeholder_treeview.svg" alt="Please wait while we are preparing your data..." class="mpa-placeholder">
                            </div>
                            <div v-else>
                                <filter-functional-annotations-dropdown v-model="percentSettings"></filter-functional-annotations-dropdown>
                                This panel shows the Enzyme Commission numbers that were matched to your peptides. 
                                <span v-html="ecTrustLine"></span>
                                Click on a row in a table to see a taxonomy tree that highlights occurrences.
                                <ec-amount-table :items="ecData" :searchSettings="faSortSettings"></ec-amount-table>
                                <div v-if="ecTreeData">
                                    <treeview :data="ecTreeData" :height="500" :width="916" :tooltip="ecTreeTooltip" :enableAutoExpand="true" style="position: relative; left: -16px; bottom: -16px;"></treeview>
                                </div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
        </v-card>
        <div id="tooltip" class="tip"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import MpaAnalysisManager from "../MpaAnalysisManager";
    import FaSortSettings from "./tables/FaSortSettings";
    import {numberToPercent, stringTitleize} from "../../utils";
    import PeptideContainer from "../PeptideContainer";
    import {FunctionalAnnotations} from "../../fa/FunctionalAnnotations";
    import EcNumbersSummary from "./tables/ec-numbers-summary.vue";
    import FilterFunctionalAnnotationsDropdown from "./filter-functional-annotations-dropdown.vue";
    import IndeterminateProgressBar from "../../components/progress/indeterminate-progress-bar.vue";
    import CardHeader from "../../components/card/card-header.vue";
    import {showInfoModal} from "../../modal";
    import Sample from "../Sample";
    import GoDataSource from "../datasource/GoDataSource";
    import { GoNameSpace } from "../../fa/GoNameSpace";
    import GoTerm from "../../fa/GoTerm";
    import GoAmountTable from "./tables/go-amount-table.vue";
    import TaxaDataSource from "../datasource/TaxaDataSource";
    import EcNumber from "../../fa/EcNumber";
    import EcDataSource from "../datasource/EcDataSource";
    import EcAmountTable from "./tables/ec-amount-table.vue";
    import TreeViewNode from "./visualizations/TreeViewNode";
    import Treeview from "./visualizations/treeview.vue";
    import FATrust from "../../fa/FATrust";

    @Component({
        components: {
            CardHeader,
            IndeterminateProgressBar,
            FilterFunctionalAnnotationsDropdown,
            EcNumbersSummary, 
            GoAmountTable,
            EcAmountTable,
            Treeview
        },
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
    export default class FunctionalSummaryCard extends Vue {
        // We need to define all namespaces as a list here, as Vue templates cannot access the GoNameSpace class 
        // directly
        private goNamespaces: GoNameSpace[] = Object.values(GoNameSpace).sort();
        private goData: {goTerms: GoTerm[], title: string}[] = [];

        private ecData: EcNumber[] = [];
        private ecTreeData: TreeViewNode = null;

        private ecTrustLine: string = "";
        private goTrustLine: string = "";

        private formatType: string = "int";

        private currentTab: number = 0;

        private ecTreeTooltip: (d: any) => string = (d: any) => {
            const fullCode = (d.name + ".-.-.-.-").split(".").splice(0, 4).join(".");
            let tip = "";
            tip += `<div class="tooltip-fa-text">
                        <strong>${d.data.count} peptides</strong> have at least one EC number within ${fullCode},<br>`;

            if (d.data.self_count == 0) {
                tip += "no specific annotations";
            } else {
                if (d.data.self_count == d.data.count) {
                    tip += " <strong>all specifically</strong> for this number";
                } else {
                    tip += ` <strong>${d.data.self_count} specificly</strong> for this number`;
                }
            }

            tip += "</div>";
            return tip;
        };

        private readonly formatters = {
            "int": x => x.toString(),
            "percent": x => numberToPercent(x),
            "2pos": x => x.toFixed(2).toString(),
        };

        private faSortSettings: FaSortSettings = new FaSortSettings(
            (x: GoTerm) => this.formatters[this.formatType](x["popularity"]),
            "popularity",
            "fractionOfPepts",
            "Peptides",
            (a, b) => b["popularity"] - a["popularity"]
        );

        private percentSettings: string = "5";

        private filteredScope: string = "";
        private numOfFilteredPepts: string = "";
        private faCalculationsInProgress: boolean = false;

        mounted() {
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
            const top5: string[] = goTerms.slice(0, 5).map(x => x.code);

            if (top5.length > 0) {
                return this.quickGOChartURL(top5, false);
            }
            return null;
        }

        private showGoModal(ns: GoNameSpace): void {
            let goTerms: GoTerm[] = this.goData[this.goNamespaces.indexOf(ns)].goTerms;
            const top5: GoTerm[] = goTerms.slice(0, 5);

            if (top5.length > 0) {
                const top5WithNames = top5.map(x => `${x.name} (${this.faSortSettings.format(x)})`);
                const top5Sentence = top5WithNames.slice(0, -1).join(", ")
                    + (top5.length > 1 ? " and " : "")
                    + top5WithNames[top5WithNames.length - 1];
                const quickGoChartURL: string = this.quickGOChartURL(top5.map(x => x.code), true);
                
                let modalContent = `
                    This chart shows the relationship between the ${top5.length} most occurring GO terms: ${top5Sentence}.
                    <br/>
                    <a href="${quickGoChartURL}" target="_blank" title="Click to enlarge in new tab">
                        <img style="max-width: 100%;" src="${quickGoChartURL}" alt="QuickGO chart of ${top5Sentence}"/>
                    </a>
                    <div>
                        Provided by <a href="https://www.ebi.ac.uk/QuickGO/annotations?goId=${top5.map(x => x.code).join(',')}" target="_blank">QuickGO</a>.
                    </div>
                `;

                showInfoModal("QuickGo " + ns, modalContent, {wide: true});
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

                this.goTrustLine = this.computeTrustLine(await goSource.getTrust(), "GO term");

                let ecSource: EcDataSource = await sample.dataRepository.createEcDataSource();
                this.ecData = await ecSource.getEcNumbers();
                this.ecTrustLine = this.computeTrustLine(await ecSource.getTrust(), "EC number");
                this.ecTreeData = await ecSource.getEcTree();
            }
        }

        /**
         * Generate a tooltip for an EC number
         * 
         * @param  ecNumber   The EC number to generate a tooltip for
         * @return {string}    HTML for the tooltip
         */
        private tooltipEC(ecNumber: EcNumber) {
            // const fmt = x => `<div class="tooltip-ec-ancestor"><span class="tooltip-ec-term">EC ${x}</span><span class="tooltip-ec-name">${ECNumbers.nameOf(x)}</span></div>`;
            // const fmth = x => `<div class="tooltip-ec-ancestor tooltip-ec-current"><span class="tooltip-ec-term">EC ${x}</span><h4 class="tooltip-fa-title">${ECNumbers.nameOf(x)}</h4></div>`;

            // let result = "";

            // if (ECNumbers.ancestorsOf(ecNumber).length > 0) {
            //     result += `${ECNumbers.ancestorsOf(ecNumber).reverse().map(c => fmt(c)).join("\n")}`;
            // }
            // result += fmth(ecNumber);

            // result += this.tootipResultSet(ecNumber, ecResultSet, oldEcResultSet);
            // return result;
            return "";
        }

        /**
         * Creates a line indicating the trust of the function annotations
         * 
         * @param trust The FATrust object that contains all necessary trust information.
         * @param kind Human readable word that fits in "To have at least one … assigned to it"
         * @return
         */
        private computeTrustLine(trust: FATrust, kind: string): string {
            if (trust.annotatedCount === 0) {
                return `<strong>No peptide</strong> has a ${kind} assigned to it. `;
            }
            if (trust.annotatedCount === trust.totalCount) {
                return `<strong>All peptides</strong> ${trust.annotatedCount <= 5 ? `(only ${trust.annotatedCount})` : ""} have at least one ${kind} assigned to them. `;
            }
            if (trust.annotatedCount === 1) {
                return `Only <strong>one peptide</strong> (${numberToPercent(trust.annotatedCount / trust.totalCount)}) has at least one ${kind} assigned to it. `;
            }
            return `<strong>${trust.annotatedCount} peptides</strong> (${numberToPercent(trust.annotatedCount / trust.totalCount)}) have at least one ${kind} assigned to them. `;
        }
    }
</script>

<style>
    .menu-header .v-list__tile {
        height: 28px;
    }

    .menu-header .v-list__tile__title {
        font-size: 12px;
        color: #777;
    }

    .menu-header .v-icon {
        font-size: 16px;
    }
</style>

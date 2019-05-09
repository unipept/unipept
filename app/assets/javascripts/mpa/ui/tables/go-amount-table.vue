<template>
    <table class="table table-condensed table-amounttable">
        <thead>
            <tr>
                <th scope="col">Peptides</th>
                <th scope="col">GO term</th>
                <th scope="col">Name</th>
                <th scope="col"></th>
                <th scope="col">
                    <button class="btn btn-default btn-xs btn-animate amounttable-download" @click="saveTableAsCSV()">
                        <span class="glyphicon glyphicon-download down"></span> Save table as CSV
                    </button>
                </th>
            </tr>
        </thead>
        <tbody>
            <template v-for="goTerm of items.slice(0, itemsVisible)">
                <tr aria-expanded="false" tabindex="0" role="button" style="cursor: pointer;" v-bind:key="goTerm.code + '-1'" @click="toggleTerm(goTerm)">
                    <td class="shaded-cell" :style="`background-image: linear-gradient(to right, rgb(221, 221, 221) ${goTerm.fractionOfPepts * 100}%, transparent ${goTerm.fractionOfPepts * 100}%); width: 5em;`">
                        {{ searchSettings.field === "fractionOfPepts" ?  (goTerm.fractionOfPepts * 100).toFixed(0) + '%' : goTerm.popularity }}
                    </td>
                    <td style="width: 7em;">
                        <a :href="`https://www.ebi.ac.uk/QuickGO/term/${goTerm.code}`" target="_blank">
                            {{ goTerm.code }}
                        </a>
                    </td>
                    <td>
                        {{ goTerm.name }}
                    </td>
                    <td style="width: 6em; text-align: right;">
                        <span class="glyphicon glyphicon-download glyphicon-inline down btn-icon" title="" role="button" tabindex="0" data-original-title="Download CSV of the matched peptides"></span>
                    </td>
                    <td class="glyphicon glyphicon-inline amounttable-chevron">
                    </td>
                </tr>
                <tr v-bind:key="goTerm.code + '-2'" v-if="expandedItemsList.indexOf(goTerm) >= 0">
                    <td colspan="5">
                        <div class="amounttable-expandrow-content">
                            <button class="btn btn-default btn-xs btn-animate pull-right" @click="saveImage(goTerm)">
                                <span class="glyphicon glyphicon-download down"></span>
                                Save as image
                            </button>
                            <treeview :id="`TreeView-${goTerm.code}`" :data="expandedItems.get(goTerm)" :height="310" :width="535" :tooltip="tooltip" :colors="highlightColorFunc" :enableAutoExpand="0.3" :linkStrokeColor="linkStrokeColor" :nodeStrokeColor="highlightColorFunc" :nodeFillColor="highlightColorFunc"></treeview>
                        </div>
                    </td>
                </tr>
            </template>
        </tbody>
        <tfoot>
            <tr class="collapse-row">
                <td colspan="5" tabindex="0" role="button" @click.left.exact="expandView(visibilityStep)" @click.shift.left.exact="expandView(100)">
                    <span class="glyphicon glyphicon-chevron-down"></span> 
                    Showing {{ itemsVisible }} of {{ items.length }} rows — <span v-if="itemsVisible >= initialItemsVisible + 2 * visibilityStep"><kbd>SHIFT+click</kbd> to</span> show {{ itemsVisible >= initialItemsVisible + 2 * visibilityStep ? 100 : visibilityStep }} more
                    <span v-if="itemsVisible > initialItemsVisible" class="glyphicon glyphicon-chevron-up btn-icon pull-right" title="Collapse row" tabindex="0" role="button" @click.left.exact="shrinkView(visibilityStep)" @click.shift.left.exact="shrinkView(100)" v-on:click.left.exact.stop></span>
                </td>
            </tr>
        </tfoot>
    </table>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import GoTerm from "../../../fa/GoTerm";
    import { tooltipContent } from "../visualizations/VisualizationHelper";
    import Sample from "../../Sample";
    import TaxaDataSource from "../../datasource/TaxaDataSource";
    import Node from "../../Node";
    import Treeview from "../visualizations/treeview.vue";
    import AmountTable from "./amount-table.vue";
    import { downloadDataByForm, logToGoogle, triggerDownloadModal } from "../../../utils";
    import { GoNameSpace } from "../../../fa/GoNameSpace";
    import FaSortSettings from "./FaSortSettings";


    @Component({
        components: {
            Treeview
        }
    })
    export default class GoAmountTable extends AmountTable {
        @Prop({required: true})
        private items: GoTerm[];
        @Prop({required: true})
        private namespace: GoNameSpace;
        @Prop({required: true})
        private searchSettings: FaSortSettings;

        // The amount of items that's always visible in the table (thus the table's minimum length)
        private initialItemsVisible: number = 5;
        // The amount of items that's currently visible in this table
        private itemsVisible: number = this.initialItemsVisible;
        // The amount of items that are shown extra when expanding the table
        private visibilityStep: number = 10;

        // Keeps track of which rows are expanded and which trees should be shown in that case.
        private expandedItems: Map<GoTerm, Node> = new Map();
        private expandedItemsList: GoTerm[] = [];

        // All settings for each Treeview that remain the same
        private tooltip: (d: any) => string = tooltipContent;
        private highlightColor: string = "#ffc107";
        private highlightColorFunc: (d: any) => string = d => (d.included ? this.highlightColor : "lightgrey");
        private linkStrokeColor: (d: any) => string = ({target: d}) => this.highlightColorFunc(d);

        private expandView(amount): void {
            if (this.itemsVisible + amount > this.items.length) {
                this.itemsVisible = this.items.length;
            } else {
                this.itemsVisible += amount;
            }
        }

        private shrinkView(amount): void {
            if (this.itemsVisible - amount < this.initialItemsVisible) {
                this.itemsVisible = this.initialItemsVisible;
            } else {
                this.itemsVisible -= amount;
            }
        }

        private async toggleTerm(term: GoTerm): Promise<void> {
            let idx: number = this.expandedItemsList.indexOf(term);
            if (idx >= 0) {
                this.expandedItemsList.splice(idx, 1);
            } else {
                if (!this.expandedItems.has(term)) {
                    let sample: Sample = this.$store.getters.activeDataset.getDataset();
                    let taxaDataSource: TaxaDataSource = await sample.dataRepository.createTaxaDataSource();
                    this.expandedItems.set(term, await taxaDataSource.getTreeByGoTerm(term));
                }

                this.expandedItemsList.push(term);
            }
        }

        private saveImage(goTerm: GoTerm): void {
            logToGoogle("Multi peptide", "Save Image for FA");
            // Hack to get a reference to the SVG DOM-element
            //@ts-ignore
            triggerDownloadModal(document.getElementById(`TreeView-${goTerm.code}`).getElementsByTagName("svg")[0], null, `unipept_treeview_${goTerm.code}`);
        }

        private saveTableAsCSV(): void {
            let columnNames: string[] = ["Peptides", "GO term", "Name"];
            let grid: string[][] = this.items.map(term => [term.popularity.toString(), term.code, term.name]);
            downloadDataByForm(this.toCSV(columnNames, grid), "GO_terms-" + this.namespace.replace(" ", "_") + "-export.csv", "text/csv");
        }

        @Watch("searchSettings", {deep: true})
        onSortSettingsChanged() {
            console.log(JSON.stringify(this.searchSettings));
        }
    }
</script>

<style scoped>
</style>

<template>
    <amount-table :items="items" :searchSettings="searchSettings" :taxaRetriever="taxaRetriever"></amount-table>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import GoTerm from "../../../fa/GoTerm";
    import { tooltipContent } from "../visualizations/VisualizationHelper";
    import Sample from "../../Sample";
    import TaxaDataSource from "../../datasource/TaxaDataSource";
    import Treeview from "../visualizations/treeview.vue";
    import AmountTable from "./amount-table.vue";
    import { downloadDataByForm, logToGoogle, triggerDownloadModal } from "../../../utils";
    import { GoNameSpace } from "../../../fa/GoNameSpace";
    import FaSortSettings from "./FaSortSettings";
    import Node from "../../Node";
    import FAElement from "../../../fa/FAElement";

    @Component({
        components: {
            AmountTable
        }
    })
    export default class GoAmountTable extends Vue {
        @Prop({required: true})
        private items: GoTerm[]
        @Prop({required: true})
        private searchSettings: FaSortSettings;
        @Prop({required: true})
        private namespace: GoNameSpace;

        private taxaRetriever: (term: GoTerm) => Promise<Node> = (term: GoTerm) => this.getTaxaTreeByTerm(term);

        private async getTaxaTreeByTerm(term: GoTerm): Promise<Node> {
            let sample: Sample = this.$store.getters.activeDataset.getDataset();
            let taxaDataSource: TaxaDataSource = await sample.dataRepository.createTaxaDataSource();
            return taxaDataSource.getTreeByGoTerm(term);
        }
    }
</script>

<style scoped>
</style>

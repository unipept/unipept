<template>
    <amount-table :items="items" :searchSettings="searchSettings" :taxaRetriever="taxaRetriever"></amount-table>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import EcNumber from "../../../fa/EcNumber";
    import Node from "../../Node";
    import { EcNameSpace } from "../../../fa/EcNameSpace";
    import Treeview from "../visualizations/treeview.vue";
    import AmountTable from "./amount-table.vue";
    import Sample from "../../Sample";
    import TaxaDataSource from "../../datasource/TaxaDataSource";
    import FaSortSettings from "./FaSortSettings";
import EcDataSource from "../../datasource/EcDataSource";

    @Component({
        components: {
            AmountTable
        }
    })
    export default class EcAmountTable extends Vue {
        @Prop({required: true})
        private items: EcNumber[]
        @Prop({required: true})
        private searchSettings: FaSortSettings;

        private taxaRetriever: (term: EcNumber) => Promise<Node> = (term: EcNumber) => this.getTaxaTreeByTerm(term);

        protected async getTaxaTreeByTerm(number: EcNumber): Promise<Node> {
            let sample: Sample = this.$store.getters.activeDataset.getDataset();
            let taxaDataSource: TaxaDataSource = await sample.dataRepository.createTaxaDataSource();
            let ecDataSource: EcDataSource = await sample.dataRepository.createEcDataSource();

            return taxaDataSource.getTreeByPeptides(ecDataSource.getPeptidesByEcNumber(number));
        }
    }
</script>

<style scoped>
</style>
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
    import TaxaDataSource from "../../datasource/TaxaDataSource";
    import FaSortSettings from "./FaSortSettings";
    import DataRepository from "../../datasource/DataRepository";
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
            let dataRepository: DataRepository = this.$store.getters.activeDataset.dataRepository;
            let taxaDataSource: TaxaDataSource = await dataRepository.createTaxaDataSource();
            let ecDataSource: EcDataSource = await dataRepository.createEcDataSource();

            return taxaDataSource.getTreeByPeptides(ecDataSource.getPeptidesByEcNumber(number));
        }
    }
</script>

<style scoped>
</style>
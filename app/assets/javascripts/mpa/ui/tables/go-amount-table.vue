<template>
    <amount-table :items="items" :searchSettings="searchSettings" :taxaRetriever="taxaRetriever"></amount-table>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import GoTerm from "../../../fa/GoTerm";
    import { tooltipContent } from "../visualizations/VisualizationHelper";
    import TaxaDataSource from "../../datasource/TaxaDataSource";
    import Treeview from "../visualizations/treeview.vue";
    import AmountTable from "./amount-table.vue";
    import { downloadDataByForm, logToGoogle, triggerDownloadModal } from "../../../utils";
    import { GoNameSpace } from "../../../fa/GoNameSpace";
    import FaSortSettings from "./FaSortSettings";
    import Node from "../../Node";
    import FAElement from "../../../fa/FAElement";
    import DataRepository from "../../datasource/DataRepository";
    import GoDataSource from "../../datasource/GoDataSource";

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
            let dataRepository: DataRepository = this.$store.getters.activeDataset.dataRepository;
            let taxaDataSource: TaxaDataSource = await dataRepository.createTaxaDataSource();
            let goDataSource: GoDataSource = await dataRepository.createGoDataSource();

            return taxaDataSource.getTreeByPeptides(goDataSource.getPeptidesByGoTerm(term));
        }
    }
</script>

<style scoped>
</style>

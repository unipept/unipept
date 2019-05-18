<template>
    <div>
        <v-select :items="taxaRanks" v-model="selectedRank" label="Rank"></v-select>
        <v-data-table v-model="selectedItems" :headers="headers" :items="items" select-all item-key="name" v-bind:pagination.sync="pagination" :loading="loading">
            <template v-slot:items="props">
                <tr :active="props.selected" @click="props.selected = !props.selected">
                    <td>
                        <v-checkbox
                            :input-value="props.selected"
                            primary
                            hide-details
                        ></v-checkbox>
                    </td>
                    <td class="text-xs-right">{{ props.item.popularity }}</td>
                    <td>{{ props.item.name }}</td>
                    <td>{{ props.item.rank }}</td>
                </tr>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component, { mixins } from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import TaxaDataSource from "../../datasource/TaxaDataSource";
    import DataSourceComponent from "./data-source-component.vue";
    import DataSourceMixin from "./data-source-mixin.vue";
    import { TaxumRank, convertStringToTaxumRank } from "../../datasource/TaxumRank";
    import TaxaElement from "../../datasource/TaxaElement";

    @Component
    export default class TaxaDataSourceComponent extends mixins(DataSourceMixin) {
        private taxaRanks: string[] = ["all"].concat(Object.values(TaxumRank));
        private selectedRank: string = this.taxaRanks[0];
        
        private items: TaxaElement[] = [];
        private selectedItems: TaxaElement[] = [];

        private loading: boolean = true;

        private headers = [
            {
                text: 'Popularity (# peptides)',
                align: 'left',
                value: 'popularity'
            },
            {
                text: 'Name',
                align: 'left',
                value: 'name'
            }, 
            {
                text: 'Rank',
                align: 'left',
                value: 'rank'
            }
        ];

        private pagination = {'sortBy': 'popularity', 'descending': true, 'rowsPerPage': 5};

        mounted() {
            this.onSelectedRankChanged();
        }

        @Watch("selectedRank")
        async onSelectedRankChanged() {
            this.loading = true;
            // Reset lists without changing the list-object reference.
            this.items.length = 0;
            this.selectedItems.length = 0;
            let rank: TaxumRank;

            let result: TaxaElement[] = await (this.dataSource as TaxaDataSource).getTopItems(30, convertStringToTaxumRank(this.selectedRank));
            this.items.push(...result);
            this.loading = false;
        }
    }
</script>

<style scoped>
</style>
<template>
    <div>
        <v-select :items="ecNameSpaces" v-model="selectedNameSpace" label="Namespace"></v-select>
        <v-data-table v-model="selectedItems" :headers="headers" :items="items" select-all item-key="code" v-bind:pagination.sync="pagination" :loading="loading">
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
                    <td>{{ props.item.code }}</td>
                    <td>{{ props.item.name }}</td>
                </tr>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component, { mixins } from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import EcDataSource from "../../datasource/EcDataSource";
    import { EcNameSpace, convertEcNumberToEcNameSpace, convertStringToEcNameSpace } from "../../../fa/EcNameSpace";
    import EcNumber from "../../../fa/EcNumber";
    import DataSourceMixin from "./data-source-mixin.vue";

    @Component
    export default class EcDataSourceComponent extends mixins(DataSourceMixin) {
        // TODO This component should be merged with the GoDataSourceComponent to reduce code duplication

        private ecNameSpaces: string[] = ["all"].concat(Object.values(EcNameSpace));
        private selectedNameSpace: string = this.ecNameSpaces[0];

        private items: EcNumber[] = [];
        private selectedItems: EcNumber[] = [];

        private loading: boolean = true;

        private headers = [
            {
                text: 'Popularity (# peptides)',
                align: 'left',
                value: 'popularity'
            },
            {
                text: 'Code',
                align: 'left',
                value: 'code'
            }, 
            {
                text: 'Name',
                align: 'left',
                value: 'name'
            }
        ];

        private pagination = {'sortBy': 'popularity', 'descending': true, 'rowsPerPage': 5}

        mounted() {
            this.onSelectedNameSpaceChanged();
        }

        @Watch("selectedNameSpace")
        async onSelectedNameSpaceChanged() {
            this.loading = true;
            // Reset lists without changing the list-object reference.
            this.items.length = 0;
            this.selectedItems.length = 0;

            let result: EcNumber[] = await (this.dataSource as EcDataSource).getTopItems(30, convertStringToEcNameSpace(this.selectedNameSpace));
            this.items.push(...result);
            this.loading = false;
        }
    }
</script>

<style scoped>
</style>
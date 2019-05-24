<template>
    <div>
        <v-select :items="goNameSpaces" v-model="selectedNameSpace" label="Namespace"></v-select>
        <v-data-table v-model="selectedItems" :headers="headers" :items="items" select-all item-key="code" v-bind:pagination.sync="pagination" :loading="loading">
            <template v-slot:items="props">
                <tr :active="props.selected" @click="props.selected = !props.selected">
                    <td>
                        <v-checkbox :input-value="props.selected" primary hide-details></v-checkbox>
                    </td>
                    <td>{{ props.item.name }}</td>
                    <td>{{ props.item.code }}</td>
                    <td class="text-xs-right">{{ props.item.popularity }}</td>
                </tr>
            </template>
        </v-data-table>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component, { mixins } from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {GoNameSpace, convertStringToGoNameSpace} from "./../../../fa/GoNameSpace";
    import GoDataSource from "../../datasource/GoDataSource";
    import GoTerm from "../../../fa/GoTerm";
    import DataSourceMixin from "./data-source-mixin.vue";

    @Component
    export default class GoDataSourceComponent extends mixins(DataSourceMixin) {
        private goNameSpaces: string[] = ["all"].concat(Object.values(GoNameSpace)).map(el => this.capitalize(el));
        private selectedNameSpace: string = this.goNameSpaces[0];

        private items: GoTerm[] = [];
        private selectedItems: Element[] = [];

        private loading: boolean = true;

        private headers = [
            {
                text: 'Name',
                align: 'left',
                value: 'name'
            },
            {
                text: 'Code',
                align: 'left',
                value: 'code'
            }, 
            
            {
                text: 'Popularity (# peptides)',
                align: 'left',
                value: 'popularity'
            }
        ];

        private pagination = {'sortBy': 'popularity', 'descending': true, 'rowsPerPage': 5};


        mounted() {
            this.onSelectedNameSpaceChanged();
        }

        @Watch("selectedNameSpace")
        async onSelectedNameSpaceChanged() {
            this.loading = true;
            // Reset lists without changing the list-object reference.
            this.items.length = 0;
            this.selectedItems.length = 0;

            let result: GoTerm[] = await (this.dataSource as GoDataSource).getTopItems(30, convertStringToGoNameSpace(this.selectedNameSpace));
            this.items.push(...result);
            this.loading = false;
        }

        @Watch("selectedItems")
        async onSelectedItemsChanged() {
            this.$emit("selected-items", this.selectedItems);
        }
    }
</script>

<style scoped>
</style>
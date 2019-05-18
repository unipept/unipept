<template>
    <div>
        <v-select :items="goNameSpaces" v-model="selectedNameSpace" label="namespace"></v-select>
        <v-data-table v-model="selectedItems" :headers="headers" :items="items" select-all item-key="code" v-bind:pagination.sync="pagination">
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
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {GoNameSpace} from "./../../../fa/GoNameSpace";
    import GoDataSource from "../../datasource/GoDataSource";
    import GoTerm from "../../../fa/GoTerm";

    @Component
    export default class GoDataSourceComponent extends Vue {
        @Prop({required: true})
        private goDataSource: GoDataSource;

        private goNameSpaces: GoNameSpace[] = Object.values(GoNameSpace);
        private selectedNameSpace: GoNameSpace = this.goNameSpaces[0];

        private items: GoTerm[] = [];
        private selectedItems: GoTerm[] = [];

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

        private pagination = {'sortBy': 'column2', 'descending': true, 'rowsPerPage': 5}


        mounted() {
            this.onSelectedNameSpaceChanged();
        }

        @Watch("selectedNameSpace")
        async onSelectedNameSpaceChanged() {
            // Reset lists without changing the list-object reference.
            this.items.length = 0;
            this.selectedItems.length = 0;
            let result: GoTerm[] = await this.goDataSource.getTopItems(30, this.selectedNameSpace);
            this.items.push(...result);

            console.log(this.items);
        }
    }
</script>

<style scoped>
</style>
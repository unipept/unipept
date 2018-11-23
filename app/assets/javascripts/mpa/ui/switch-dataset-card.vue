<template>
    <card title="Metaproteomics Analysis">
        <list class="switch-dataset-list" placeholder="Please add one or more datasets by clicking the plus button above... ">
            <div class="list-item--two-lines" v-for="dataset of selectedDatasets">
                <span class="list-item-primary-action">
                    <input type="radio" class="input-item select-dataset-radio-button" style="width: 24px;" />
                </span>
                <span class="list-item-primary-content">
                    <span class="list-item-body">
                        {{ dataset.getAmountOfPeptides() }} peptides
                    </span>
                    <span class="list-item-date">
                        {{ dataset.getDateFormatted() }}
                    </span>
                </span>
                <span class="list-item-secondary-action" @click="deselectDataset(dataset)">
                    <span class="glyphicon glyphicon-trash">
                    </span>
                </span>
            </div>
        </list>
    </card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Card from "../../components/card/card.vue";
    import List from "../../components/list/list.vue";
    import NewPeptideContainer from "../NewPeptideContainer";

    @Component({
        components: {Card, List}
    })
    export default class SwitchDatasetCard extends Vue {
        deselectDataset(dataset: NewPeptideContainer): void {
            this.$store.dispatch('deselectDataset', dataset);
        }
    }
</script>

<style scoped>

</style>

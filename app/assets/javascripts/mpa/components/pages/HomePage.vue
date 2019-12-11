<template>
    <div>
        <v-row>
            <v-col>
                <select-datasets-card
                    :selected-datasets="this.$store.getters.selectedDatasets"
                    v-on:deselect-dataset="onDeselectDataset"
                    v-on:start-analysis="onStartAnalysis"
                    style="min-height: 100%;">
                </select-datasets-card>
            </v-col>
            <v-col class="col-md-6">
                <load-datasets-card 
                    :selected-datasets="this.$store.getters.selectedDatasets" 
                    :stored-datasets="this.$store.getters.storedDatasets"
                    style="min-height: 100%;">
                </load-datasets-card>
            </v-col>
        </v-row>
        <search-help></search-help>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import LoadDatasetsCard from "unipept-web-components/src/components/dataset/LoadDatasetsCard.vue";
import SelectDatasetsCard from "./../dataset/SelectDatasetsCard.vue";
import SearchHelp from "./../miscellaneous/SearchHelp.vue";
import PeptideContainer from "unipept-web-components/src/logic/data-management/PeptideContainer";
import { EventBus } from "unipept-web-components/src/components/EventBus";
import Assay from "unipept-web-components/src/logic/data-management/assay/Assay";

@Component({
    components: {
        LoadDatasetsCard, 
        SelectDatasetsCard, 
        SearchHelp
    }
})
/**
 * @vue-event {void} start-analysis Emitted when the user indicates that he wants to start analysis of the chosen 
 *            assays.
 */
export default class HomePage extends Vue {
    private listeners: {type: string, listener: any} [] = [];

    private onDeselectDataset(assay: Assay) {
        this.$store.dispatch('deselectDataset', assay);
    }

    private onStartAnalysis() {
        this.$emit("start-analysis");
    }
};
</script>

<style scoped>

</style>

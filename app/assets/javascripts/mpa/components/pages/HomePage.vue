<template>
    <div>
        <v-row>
            <v-col>
                <select-datasets-card
                    :selected-datasets="this.$store.getters.selectedDatasets"
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
import SelectDatasetsCard from "unipept-web-components/src/components/dataset/SelectDatasetsCard.vue";
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
export default class HomePage extends Vue {
    private listeners: {type: string, listener: any} [] = [];

    private mounted() {
        this.initializeEventListeners();
    }

    private beforeDestroy() {
        this.destroyEventListeners();
    }

    private initializeEventListeners() {
        this.listeners.push({
            type: "select-dataset", 
            listener: (dataset: PeptideContainer) => {
                this.$store.dispatch('selectDataset', dataset);
            }
        });

        this.listeners.push({
            type: "deselect-dataset",
            listener: (dataset: Assay) => {
                this.$store.dispatch("deselectDataset", dataset);
            }
        });

        this.listeners.push({
            type: "store-dataset",
            listener: (dataset: PeptideContainer) => {
                this.$store.dispatch("addStoredDataset", dataset);
            }
        });

        for (let listener of this.listeners) {
            EventBus.$on(listener.type, listener.listener);
        }
    }
    
    private destroyEventListeners() {
        // Deregister event listeners
        for (let listener of this.listeners) {
            EventBus.$off(listener.type, listener.listener);
        }
    }
};
</script>

<style scoped>

</style>

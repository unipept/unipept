<template>
    <div>
        <div class="row equal-height-row">
            <div class="col-md-6">
                <select-datasets-card
                    :selected-datasets="this.$store.getters.selectedDatasets"
                    style="min-height: 100%;">
                </select-datasets-card>
            </div>
            <div class="col-md-6">
                <load-datasets-card 
                    :selected-datasets="this.$store.getters.selectedDatasets" 
                    :stored-datasets="this.$store.getters.storedDatasets"
                    style="min-height: 100%;">
                </load-datasets-card>
            </div>
        </div>
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

@Component({
    components: {
        LoadDatasetsCard, 
        SelectDatasetsCard, 
        SearchHelp
    }
})
export default class HomePage extends Vue {
    private mounted() {
        this.initializeEventListeners();
    }

    private initializeEventListeners() {
        EventBus.$on("select-dataset", (dataset: PeptideContainer) => {
            this.$store.dispatch('selectDataset', dataset);
        })
        
        EventBus.$on("activate-dataset", (dataset: PeptideContainer) => {
            this.$store.dispatch("setActiveDataset", dataset);
        })
    }
};
</script>

<style scoped>

</style>

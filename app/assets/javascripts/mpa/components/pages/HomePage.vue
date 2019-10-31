<template>
    <div>
        <div class="row equal-height-row">
            <!-- <div class="col-md-6">
                <select-datasets-card 
                    style="min-height: 100%;">
                </select-datasets-card>
            </div>
            <div class="col-md-6">
                <load-datasets-card 
                    :selected-datasets="this.$store.getters.selectedDatasets" 
                    :stored-datasets="this.$store.getters.storedDatasets"
                    v-on:select-dataset="onSelectDataset"
                    style="min-height: 100%;">
                </load-datasets-card>
            </div> -->
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

@Component({
    components: {
        LoadDatasetsCard, 
        // SelectDatasetsCard, 
        SearchHelp
    }
})
export default class HomePage extends Vue {
    private onSelectDataset(dataset: PeptideContainer) {
        this.$store.dispatch('selectDataset', dataset);
        this.$store.dispatch('processDataset', dataset);
    }
};
</script>

<style scoped>

</style>

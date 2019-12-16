<template>
    <div>
        <v-row>
            <v-col>
                <select-datasets-card
                    :selected-assays="this.$store.getters.getSelectedAssays"
                    v-on:deselect-assay="onDeselectAssay"
                    v-on:start-analysis="onStartAnalysis"
                    style="min-height: 100%;">
                </select-datasets-card>
            </v-col>
            <v-col class="col-md-6">
                <load-datasets-card 
                    :selected-assays="this.$store.getters.getSelectedAssays" 
                    :stored-assays="this.$store.getters.getStoredAssays"
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
import LoadDatasetsCard from "./../dataset/LoadDatasetsCard.vue";
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
export default class HomePage extends Vue {
    private listeners: {type: string, listener: any} [] = [];

    private onDeselectAssay(assay: Assay) {
        this.$store.dispatch('deselectAssay', assay);
    }

    private onStartAnalysis(status: boolean) {
        this.$emit("start-analysis", status);
    }
};
</script>

<style scoped>

</style>

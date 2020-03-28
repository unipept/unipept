<template>
    <div>
        <v-row>
            <v-col>
                <select-datasets-card
                    v-on:deselect-assay="onDeselectAssay"
                    v-on:start-analysis="onStartAnalysis"
                    style="min-height: 100%;">
                </select-datasets-card>
            </v-col>
            <v-col class="col-md-6">
                <load-datasets-card style="min-height: 100%;">
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
import { Prop } from "vue-property-decorator";
import ProteomicsAssay from "unipept-web-components/src/business/entities/assay/ProteomicsAssay";

@Component({
    components: {
        LoadDatasetsCard,
        SelectDatasetsCard,
        SearchHelp
    }
})
export default class HomePage extends Vue {
    private onDeselectAssay(assay: ProteomicsAssay) {
        this.$store.dispatch("removeAssay", assay);
    }

    private onStartAnalysis(status: boolean) {
        this.$emit("start-analysis", status);
    }


};
</script>

<style scoped>

</style>

<template>
    <v-card>
        <v-tabs grow
            :dark="isDark"
            :color="tabsTextColor"
            :background-color="tabsColor"
            :slider-color="tabsSliderColor"
            v-model="currentTab">
            <v-tab>
                Create
            </v-tab>
            <v-tab>
                Sample data
            </v-tab>
            <v-tab>
                Pride
            </v-tab>
            <v-tab>
                Local data
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="currentTab">
            <v-tab-item>
                <create-dataset-card
                    v-on:create-assay="onCreateAssay"
                    v-on:destroy-assay="onDestroyAssay"
                    v-on:store-assay="onStoreAssay">
                </create-dataset-card>
            </v-tab-item>

            <v-tab-item>
                <load-sample-dataset-card
                    v-on:create-assay="onCreateAssay"
                    v-on:destroy-assay="onDestroyAssay"
                    v-on:store-assay="onStoreAssay">
                </load-sample-dataset-card>
            </v-tab-item>

            <v-tab-item>
                <load-pride-dataset-card
                    v-on:create-assay="onCreateAssay"
                    v-on:destroy-assay="onDestroyAssay"
                    v-on:store-assay="onStoreAssay">
                </load-pride-dataset-card>
            </v-tab-item>

            <v-tab-item>
                <load-local-dataset-card
                    v-on:create-assay="onCreateAssay"
                    v-on:destroy-assay="onDestroyAssay"
                    v-on:store-assay="onStoreAssay"
                    :stored-assays="$store.getters.getStoredAssays">
                </load-local-dataset-card>
            </v-tab-item>
        </v-tabs-items>
    </v-card>
</template>

<script lang="ts">
import Vue from "vue";

import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import CreateDatasetCard from "unipept-web-components/src/components/dataset/CreateDatasetCard.vue";
import LoadSampleDatasetCard from "unipept-web-components/src/components/dataset/LoadSampleDatasetCard.vue";
import LoadPrideDatasetCard from "unipept-web-components/src/components/dataset/LoadPrideDatasetCard.vue";
import LoadLocalDatasetCard from "unipept-web-components/src/components/dataset/LoadLocalDatasetCard.vue";
import ProteomicsAssay from "unipept-web-components/src/business/entities/assay/ProteomicsAssay";
import Tooltip from "unipept-web-components/src/custom/Tooltip.vue";
import BrowserStorageRemover from "unipept-web-components/src/business/storage/browser/assay/BrowserStorageRemover";
import BrowserStorageWriter from "unipept-web-components/src/business/storage/browser/assay/BrowserStorageWriter";

@Component({
    components: {
        CreateDatasetCard,
        LoadSampleDatasetCard,
        LoadPrideDatasetCard,
        LoadLocalDatasetCard
    }
})
export default class LoadDatasetsCard extends Vue {
    @Prop({ required: false, default: "primary" })
    private tabsColor: string;
    @Prop({ required: false, default: "secondary" })
    private tabsSliderColor: string;
    @Prop({ required: false, default: "white" })
    private tabsTextColor: string;
    @Prop({ required: false, default: true })
    private isDark: boolean;

    private currentTab: number = 0;

    private onCreateAssay(assay: ProteomicsAssay) {
        this.$store.dispatch("addAssay", assay);
    }

    private onDestroyAssay(assay: ProteomicsAssay) {
        // Remove the assay from the store, then also delete it from local storage.
        this.deleteAssayFromStorage(assay);
    }

    private onStoreAssay(assay: ProteomicsAssay, localStorage: boolean) {
        this.storeAssayInStorage(assay, localStorage);
    }

    /**
     * Remove all data about an assay from persistent storage.
     *
     * @param assay Assay for which all data should be removed from persistent storage.
     */
    private deleteAssayFromStorage(assay: ProteomicsAssay) {
        this.$store.dispatch("removeStoredAssay", assay);
        this.$store.dispatch("removeAssay", assay);
        const storageRemover: BrowserStorageRemover = new BrowserStorageRemover(window.localStorage);
        assay.accept(storageRemover);
    }

    /**
     * Write all data related to the given assay to persistent storage.
     *
     * @param assay Assay for which all data should be written to persistent storage.
     */
    private async storeAssayInStorage(assay: ProteomicsAssay, localStorage: boolean) {
        const storageWriter: BrowserStorageWriter = new BrowserStorageWriter(localStorage ? window.localStorage : window.sessionStorage);
        await assay.accept(storageWriter);
        // We only need to add the assay to the store, if it's explicitly written to local storage.
        if (localStorage) {
            await this.$store.dispatch('addStoredAssay', assay);
        }
    }
}
</script>

<style lang="less">
    .peptide-amount-wrapper {
        display: flex !important;
        flex-direction: row;
        justify-content: space-between;
    }

    .load-sample-container .row {
        flex-wrap: nowrap;
    }
</style>

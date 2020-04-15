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
        <v-snackbar v-model="errorSnackbar" color="error" multi-line :timeout="0" top>
            Could not save this assay due to storage restrictions. You can still analyse the assay now, but you will not
            be able to restore it in future sessions. Please delete some unused assays to make space for this one.
            <v-btn color="white" text @click="errorSnackbar = false">
                Close
            </v-btn>
        </v-snackbar>
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
    private errorSnackbar: boolean = false;

    private onCreateAssay(assay: ProteomicsAssay) {
        this.$store.dispatch("addAssay", assay);
        this.$emit("create-assay", assay);
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
        if (localStorage) {
            const storageWriter: BrowserStorageWriter = new BrowserStorageWriter(window.localStorage);
            try {
                await assay.accept(storageWriter);
            } catch (err) {
                console.error(err);
                this.errorSnackbar = true;
            }
            // We only need to add the assay to the store, if it's explicitly written to local storage.
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

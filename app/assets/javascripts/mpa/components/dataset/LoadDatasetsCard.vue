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
import Assay from "unipept-web-components/src/logic/data-management/assay/Assay";
import CreateDatasetCard from "unipept-web-components/src/components/dataset/CreateDatasetCard.vue";
import LoadSampleDatasetCard from "unipept-web-components/src/components/dataset/LoadSampleDatasetCard.vue";
import LoadPrideDatasetCard from "unipept-web-components/src/components/dataset/LoadPrideDatasetCard.vue";
import LoadLocalDatasetCard from "unipept-web-components/src/components/dataset/LoadLocalDatasetCard.vue";

import SampleDataset from "unipept-web-components/src/logic/data-management/SampleDataset";
import Tooltip from "unipept-web-components/src/custom/Tooltip.vue";
import SampleDatasetCollection from "unipept-web-components/src/logic/data-management/SampleDatasetCollection";
import StorageWriter from "unipept-web-components/src/logic/data-management/visitors/storage/StorageWriter";
import { StorageType } from "unipept-web-components/src/logic/data-management/StorageType";
import StorageRemover from "unipept-web-components/src/logic/data-management/visitors/storage/StorageRemover";

@Component({
    components: {
        CreateDatasetCard,
        LoadSampleDatasetCard,
        LoadPrideDatasetCard,
        LoadLocalDatasetCard
    }
})
export default class LoadDatasetsCard extends Vue {
    @Prop({ required: true })
    private storedAssays: Assay[];
    @Prop({ required: true })
    private selectedAssays: Assay[];
    @Prop({ required: false, default: "primary" })
    private tabsColor: string;
    @Prop({ required: false, default: "secondary" })
    private tabsSliderColor: string;
    @Prop({ required: false, default: "white" })
    private tabsTextColor: string;
    @Prop({ required: false, default: true })
    private isDark: boolean;

    private currentTab: number = 0;

    private onCreateAssay(assay: Assay) {
        this.$store.dispatch("selectAssay", assay);
        this.$emit("create-assay", assay);
    }

    private onDestroyAssay(assay: Assay) {
        // Remove the assay from the store, then also delete it from local storage.
        this.$store.dispatch('removeStoredAssay', assay);
        this.deleteAssayFromStorage(assay);
        this.$emit("destroy-assay", assay);
    }

    private onStoreAssay(assay: Assay) {
        this.storeAssayInStorage(assay);
        this.$emit("store-assay", assay);
    }

    /**
     * Remove all data about an assay from persistent storage.
     * 
     * @param assay Assay for which all data should be removed from persistent storage.
     */
    private deleteAssayFromStorage(assay: Assay) {
        this.$store.dispatch('removeStoredAssay', assay);
        const storageRemover: StorageRemover = new StorageRemover();
        assay.visit(storageRemover);
    }

    /**
     * Write all data related to the given assay to persistent storage.
     * 
     * @param assay Assay for which all data should be written to persistent storage.
     */
    private storeAssayInStorage(assay: Assay) {
        const storageWriter: StorageWriter = new StorageWriter();
        assay.visit(storageWriter).then(() => {
            // We only need to add the assay to the store, if it's explicitly written to local storage.
            if (assay.getStorageType() === StorageType.LocalStorage) {
                this.$store.dispatch('addStoredAssay', assay);
            }
        });
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

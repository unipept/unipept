<template>
    <v-app v-if="!this.loading" class="unipept-web-app">
        <home-page v-if="!isAnalysis" v-on:start-analysis="onStartAnalysis"></home-page>
        <analysis-page v-else></analysis-page>
    </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import HomePage from "./pages/HomePage.vue";
import AnalysisPage from "./pages/AnalysisPage.vue";
import {Prop} from "vue-property-decorator";
import PeptideContainer from "unipept-web-components/src/logic/data-management/PeptideContainer";
import Assay from "unipept-web-components/src/logic/data-management/assay/Assay";
import MetaProteomicsAssay from "unipept-web-components/src/logic/data-management/assay/MetaProteomicsAssay";
import BrowserStorageWriter from "unipept-web-components/src/logic/data-management/assay/browser/BrowserStorageWriter";
import { StorageType } from "unipept-web-components/src/logic/data-management/StorageType";
import DatasetManager from "unipept-web-components/src/logic/data-management/DatasetManager";
import { v4 as uuidv4 } from "uuid";


@Component({
    components: {
        HomePage, 
        AnalysisPage
    }
})
export default class App extends Vue {
    @Prop({default: ""})
    public peptides: string;
    // Cannot get boolean value directly from incoming string
    @Prop({default: true})
    public il: string;
    @Prop({default: true})
    public dupes: string;
    @Prop({default: false})
    public missed: string;
    @Prop({default: ""})
    public searchName: string;

    private isAnalysis: boolean = false;
    private loading: boolean = true;

    async mounted() {
        this.loading = true;
        await this.$store.dispatch('setBaseUrl', "");
        await this.readStoredAssays();
        this.loading = false;

        // Code that's processed when the application is called with a POST-request containing all required data.
        if (this.peptides != "") {
            let name;
            if (this.searchName === "") {
                name = "Unnamed";
            } else {
                name = this.searchName;
            }

            let assay: MetaProteomicsAssay = new MetaProteomicsAssay([], uuidv4());
            let storageWriter: BrowserStorageWriter = new BrowserStorageWriter();
            assay.setPeptides(this.peptides.trimRight().split(/\n/));
            assay.setDate(new Date());
            assay.setStorageType(StorageType.SessionStorage);
            assay.setName(name);
            
            await this.$store.dispatch('setSearchSettings', {
                il: this.il.toLowerCase() === "true",
                dupes: this.dupes.toLowerCase() === "true",
                missed: this.missed.toLowerCase() === "true"
            });
            
            await assay.accept(storageWriter);

            await this.$store.dispatch('selectAssay', assay);
            this.isAnalysis = true;
        }
    }

    private onStartAnalysis(status: boolean) {
        this.isAnalysis = status;
    }
    
    private async readStoredAssays() {
        const datasetManager: DatasetManager = new DatasetManager();
        const assays = await datasetManager.listDatasets();
        for (let assay of assays) {
            await this.$store.dispatch("addStoredAssay", assay);
        }
    }
};
</script>

<style>
    .v-list__tile__action .fix-icon-list-position {
        position: relative;
        bottom: 2px;
    }

    .v-input--checkbox {
        margin-top: 0;
    }

    .v-application--wrap {
        /* Fix too high application content */
        min-height: 0 !important;
    }

    /* Reset header styling */
    h1, h2, h3, h4, h5 {
        font-weight: 700;
        letter-spacing: initial;
        line-height: initial;
        margin: 0;
        color: rgb(85, 85, 85);
    }

    h2 {
        font-size: 21px;
    }

    h3 {
        font-size: 16px;
    }

    .theme--light.v-card > .v-card__text, .theme--light.v-label  {
        color: rgb(85, 85, 85);
    }

</style>

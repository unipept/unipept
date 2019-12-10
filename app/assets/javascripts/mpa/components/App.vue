<template>
    <v-app v-if="!this.loading" class="unipept-web-app">
        <home-page v-if="!isAnalysis"></home-page>
        <analysis-page v-else></analysis-page>
    </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import HomePage from "./pages/HomePage.vue";
import AnalysisPage from "./pages/AnalysisPage.vue";
import {Prop} from "vue-property-decorator";
import { EventBus } from "unipept-web-components/src/components/EventBus";
import PeptideContainer from "unipept-web-components/src/logic/data-management/PeptideContainer";
import Assay from "unipept-web-components/src/logic/data-management/assay/Assay";
import MetaProteomicsAssay from "unipept-web-components/src/logic/data-management/assay/MetaProteomicsAssay";
import StorageWriter from "unipept-web-components/src/logic/data-management/visitors/storage/StorageWriter";
import { StorageType } from "unipept-web-components/src/logic/data-management/StorageType";


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
        EventBus.$on("start-analysis", () => this.isAnalysis = true);
        this.$store.dispatch('setBaseUrl', "");
        this.loading = false;

        if (this.peptides != "") {
            let name;
            if (this.searchName === "") {
                name = "Unnamed";
            } else {
                name = this.searchName;
            }

            let assay: MetaProteomicsAssay = new MetaProteomicsAssay();
            let storageWriter: StorageWriter = new StorageWriter();
            assay.setPeptides(this.peptides.trimRight().split(/\n/));
            assay.setDate(new Date());
            assay.setStorageType(StorageType.SessionStorage);
            assay.setName(name);
            
            this.$store.dispatch('setSearchSettings', {
                il: this.il.toLowerCase() === "true",
                dupes: this.dupes.toLowerCase() === "true",
                missed: this.missed.toLowerCase() === "true"
            });
            
            await assay.visit(storageWriter);

            EventBus.$emit("select-dataset", assay);
            this.isAnalysis = true;
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

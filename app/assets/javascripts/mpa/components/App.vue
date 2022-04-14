<template>
    <v-app v-if="!this.loading" class="unipept-web-app">
        <home-page
            v-if="!isAnalysis"
            v-on:start-analysis="onStartAnalysis">
        </home-page>
        <analysis-page v-else></analysis-page>
    </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import HomePage from "./pages/HomePage.vue";
import AnalysisPage from "./pages/AnalysisPage.vue";
import {Prop} from "vue-property-decorator";
import { v4 as uuidv4 } from "uuid";
import {
    ProteomicsAssay,
    BrowserStorageWriter,
    BrowserAssayManager,
    NetworkConfiguration, QueueManager, SearchConfiguration
} from "unipept-web-components";

@Component({
    components: {
        HomePage,
        AnalysisPage
    }
})
export default class App extends Vue {
    @Prop({default: ""})
    private peptides: string;
    // Cannot get boolean value directly from incoming string
    @Prop({default: true})
    private il: string;
    @Prop({default: true})
    private dupes: string;
    @Prop({default: false})
    private missed: string;
    @Prop({default: ""})
    private searchName: string;

    private isAnalysis: boolean = false;
    private loading: boolean = true;

    async mounted() {
        this.loading = true;
        NetworkConfiguration.BASE_URL = "https://api.unipept.ugent.be";
        NetworkConfiguration.PARALLEL_API_REQUESTS = 2;
        QueueManager.initializeQueue(4);
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

            let assay: ProteomicsAssay = new ProteomicsAssay([], uuidv4());
            assay.setPeptides(this.peptides.trimRight().split(/\n/));
            assay.setDate(new Date());
            assay.setName(name);
            assay.setSearchConfiguration(
                new SearchConfiguration(
                    this.il.toLowerCase() === "true",
                    this.dupes.toLowerCase() === "true",
                    this.missed.toLowerCase() === "true"
                )
            );

            await this.$store.dispatch("addAssay", assay);
            this.isAnalysis = true;
        }
    }

    private onStartAnalysis(status: boolean) {
        this.isAnalysis = status;
    }

    private async readStoredAssays() {
        const browserManager = new BrowserAssayManager();
        for (const assay of await browserManager.listAssays()) {
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
        font-size: 21px
    }

    h3 {
        font-size: 16px;
    }

    .theme--light.v-card > .v-card__text, .theme--light.v-label  {
        color: rgb(85, 85, 85);
    }

    .theme--light.v-application {
        background-color: #FAFAFA !important;
    }
</style>

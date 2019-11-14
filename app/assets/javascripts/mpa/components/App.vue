<template>
    <v-app v-if="!this.loading">
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


@Component({
    components: {
        HomePage, 
        AnalysisPage
    }
})
export default class App extends Vue {
    @Prop({default: ""})
    public peptides: string;
    @Prop({default: true})
    public il: boolean;
    @Prop({default: true})
    public dupes: boolean;
    @Prop({default: false})
    public missed: boolean;
    @Prop({default: ""})
    public searchName: string;

    private isAnalysis: boolean = false;
    private loading: boolean = true;

    async mounted() {
        this.loading = true;
        EventBus.$on("start-analysis", () => this.isAnalysis = true);
        this.$store.dispatch('setBaseUrl', "");
        this.loading = false;
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

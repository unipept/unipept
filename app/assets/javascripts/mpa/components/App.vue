<template>
    <v-app>
        <home-page></home-page>
        <analysis-page></analysis-page>
    </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import HomePage from "./pages/HomePage.vue";
import AnalysisPage from "./pages/AnalysisPage.vue";
import {Prop} from "vue-property-decorator";

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

    mounted() {}
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
</style>

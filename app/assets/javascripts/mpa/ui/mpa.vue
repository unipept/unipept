<template>
    <v-app>
        <mpa-home v-if="!this.$store.getters.isAnalysis"></mpa-home>
        <mpa-analysis v-else></mpa-analysis>
    </v-app>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import MpaHome from "./mpa-home.vue";
    import {Prop} from "vue-property-decorator";
    import MpaAnalysis from "./mpa-analysis.vue";
    import PeptideContainer from "../PeptideContainer";
    import MpaAnalysisManager from "../MpaAnalysisManager";
    import DatasetManager from "../DatasetManager";
    import { StorageType } from "../StorageType";

    @Component({
        components: {MpaAnalysis, MpaHome}
    })
    export default class Mpa extends Vue {
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

        mounted() {
            if (this.peptides != "") {
                const storageManager: DatasetManager = new DatasetManager();
                const dataset: PeptideContainer = new PeptideContainer();
                dataset.setName(this.searchName);
                dataset.setPeptides(this.peptides.split(/\\n/));
                dataset.setDate(new Date());
                dataset.setType(StorageType.SessionStorage);

                this.$store.dispatch('setSearchSettings', {
                    il: this.il,
                    dupes: this.dupes,
                    missed: this.missed
                })

                dataset.store().then(() => {
                    this.$store.dispatch('selectDataset', dataset);
                    this.$store.dispatch('setAnalysis', true);
                });
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
</style>

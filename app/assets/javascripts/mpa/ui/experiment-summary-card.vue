<template>
    <card>
        <card-header>
            <card-title>Experiment summary</card-title>
        </card-header>
        <card-body>
            <search-settings-form
                    :disabled="$store.getters.selectedDatasets.some(el => el.getProgress() !== 1)"
                    :equate-il="equateIl"
                    v-on:equate-il-change="equateIl = $event"
                    :filter-duplicates="filterDuplicates"
                    v-on:filter-duplicates-change="filterDuplicates = $event"
                    :missing-cleavage="missingCleavage"
                    v-on:missing-cleavage="missingCleavage = $event"
            ></search-settings-form>
            <div class="search-buttons-centered">
                <simple-button label="Update" glyphicon="repeat" type="primary" @click="reprocess()"></simple-button>
            </div>
            <hr>
            <span v-if="!this.$store.getters.activeDataset">No dataset is selected... Wait for at least one dataset to be loaded or select one.</span>
            <span v-else>
                We managed to match xx of your {{ this.$store.getters.activeDataset.getAmountOfPeptides() }} peptides.
                Unfortunately, xx peptides couldn't be found.
            </span>
        </card-body>
    </card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Card from "../../components/card/card.vue";
    import SearchSettingsForm from "./search-settings-form.vue";
    import SimpleButton from "../../components/button/simple-button.vue";
    import CardHeader from "../../components/card/card-header.vue";
    import CardTitle from "../../components/card/card-title.vue";
    import CardBody from "../../components/card/card-body.vue";
    import SearchSettings from "../SearchSettings";
    @Component({
        components: {CardBody, CardTitle, CardHeader, SimpleButton, SearchSettingsForm, Card}
    })
    export default class ExperimentSummaryCard extends Vue {
        equateIl: boolean = true;
        filterDuplicates: boolean = true;
        missingCleavage: boolean = false;

        created() {
            this.equateIl = this.$store.getters.searchSettings.isEquateIl();
            this.filterDuplicates = this.$store.getters.searchSettings.isFilterDuplicates();
            this.missingCleavage = this.$store.getters.searchSettings.isHandleMissingCleavage();
        }

        reprocess(): void {
            this.$store.dispatch('setSearchSettings', new SearchSettings(this.equateIl, this.filterDuplicates, this.missingCleavage));

            this.$store.dispatch('setActiveDataset', null);
            for (let dataset of this.$store.getters.selectedDatasets) {
                this.$store.dispatch('processDataset', dataset);
            }
        }
    }
</script>

<style scoped>

</style>

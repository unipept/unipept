<template>
    <card title="Experiment summary">
        <search-settings-form></search-settings-form>
        <div class="search-buttons-centered">
            <simple-button label="Update" glyphicon="repeat" type="primary"></simple-button>
        </div>
        <hr>
        <span v-if="this.$store.getters.activeDataset">No dataset is selected... Wait for at least one dataset to be loaded or select one.</span>
        <span v-else>
            We managed to match xx of your xx peptides.
            Unfortunately, xx peptides couldn't be found.
        </span>
    </card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Card from "../../components/card/card.vue";
    import SearchSettingsForm from "./search-settings-form.vue";
    import SimpleButton from "../../components/button/simple-button.vue";
    @Component({
        components: {SimpleButton, SearchSettingsForm, Card}
    })
    export default class ExperimentSummaryCard extends Vue {
        equateIl: boolean = true;
        filterDuplicates: boolean = true;
        missingCleavage: boolean = true;
    }
</script>

<style scoped>

</style>

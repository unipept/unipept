<template>
    <card title="Experiment summary">
        <search-settings-form></search-settings-form>
        <div class="search-buttons-centered">
            <simple-button label="Update" glyphicon="repeat" type="primary"></simple-button>
        </div>
        <hr>

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

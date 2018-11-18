<template>
    <card title="Metaproteomics Analysis">
        <label>Select datasets</label>
        <list placeholder="Please select one or more datasets from the right hand panel to continue the analysis..">
            <div class="list-item--two-lines">

            </div>
        </list>
        <label>Search settings</label>
        <checkbox label="Equate I and L" placeholder="Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries."></checkbox>
    </card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Card from "../../components/card/card";
    import Checkbox from "../../components/input/checkbox";
    import List from "../../components/list/list";
    import PeptideContainer from "../peptideContainer";
    import DatasetManager from "../datasetManager"

    @Component({
        components: {Checkbox, Card, List}
    })
    export default class SelectDatasetsCard extends Vue {
        datasetManager: DatasetManager = new DatasetManager();


    }
</script>

<style scoped>

</style>

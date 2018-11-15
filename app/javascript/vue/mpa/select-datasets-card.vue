<template>
    <card title="Metaproteomics Analysis">
        <label>Select datasets</label>
        <span>Please select one or more datasets from the right hand panel to continue the analysis...</span>

        <label>Search settings</label>
        <checkbox label="Equate I and L" placeholder="Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries."></checkbox>
    </card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Card from "../components/card/card";
    import Checkbox from "../components/input/checkbox";

    @Component({
        components: {Checkbox, Card}
    })
    export default class SelectDatasetsCard extends Vue {

    }
</script>

<style scoped>

</style>

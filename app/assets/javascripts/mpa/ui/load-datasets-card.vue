<template>
    <card-nav>
        <tab label="Create" :active="true">
            <dataset-form></dataset-form>
            <div class="search-buttons-centered">
                <simple-button label="Add to selected datasets" glyphicon="plus"></simple-button>
            </div>
        </tab>
        <tab label="Sample data">
        </tab>
        <tab label="Pride">
            <h3>Load data from the PRIDE archive</h3>
            <p>You can easily load data from the <a href="http://www.ebi.ac.uk/pride/" target="_blank">PRIDE</a> data repository. Simply enter an assay id (e.g. 8500) in the field below and click the 'Load PRIDE Dataset' button. The corresponding dataset will then be fetched using the PRIDE API and loaded into the search form on the left.</p>
            <dataset-form></dataset-form>
            <div class="search-buttons-centered">
                <simple-button label="Add to selected datasets" glyphicon="plus"></simple-button>
            </div>
        </tab>
        <tab label="Local data">
            <list placeholder="There are currently no datasets present in your browser's local storage.">
                <div class="list-item--two-lines" >
                </div>
            </list>
        </tab>
    </card-nav>
</template>

<script lang="ts">
    import Vue from "vue";

    import Component from "vue-class-component";
    import DatasetForm from "./dataset-form";
    import Tab from "../../components/card/tab"
    import CardNav from "../../components/card/card-nav";
    import SimpleButton from "../../components/button/simple-button";
    import List from "../../components/list/list";
    import NewDatasetManager from "../NewDatasetManager";
    import {StorageType} from "../StorageType";

    @Component({
        components: {SimpleButton, CardNav, DatasetForm, Tab, List}
    })
    export default class LoadDatasetsCard extends Vue {
        localStorageManager: NewDatasetManager = new NewDatasetManager();
        sessionStorageManager: NewDatasetManager = new NewDatasetManager(StorageType.SessionStorage);


    };
</script>

<style scoped>
</style>

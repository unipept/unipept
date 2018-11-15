<template>
    <div class="card card-nav">
        <div class="card-title card-title-colored">
            <ul class="nav nav-tabs">
                <li class="active"><a href="#create" data-toggle="tab">Create</a></li>
                <li><a href="#database">Sample data</a></li>
                <li><a href="#pride">Pride</a></li>
                <li><a href="#local-storage">Local data</a></li>
            </ul>
        </div>
        <div class="card-supporting-text">
            <div class="tab-content">
                <div class="tab-pane active" id="create">
                    <dataset-form></dataset-form>
                </div>
                <div class="tab-pane" id="database">
                </div>
                <div class="tab-pane" id="pride">
                    <h3>Load data from the PRIDE archive</h3>
                    <p>You can easily load data from the <a href="http://www.ebi.ac.uk/pride/" target="_blank">PRIDE</a> data repository. Simply enter an assay id (e.g. 8500) in the field below and click the 'Load PRIDE Dataset' button. The corresponding dataset will then be fetched using the PRIDE API and loaded into the search form on the left.</p>
                </div>
                <div class="tab-pane" id="local-storage">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import DatasetForm from "./dataset-form";

    export default {
        name: "load-datasets-card",
        components: {DatasetForm},
    };
</script>

<style scoped>

</style>

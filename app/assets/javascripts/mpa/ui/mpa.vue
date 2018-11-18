<template>
    <div class="row">
        <div class="col-md-6">
            <select-datasets-card></select-datasets-card>
        </div>
        <div class="col-md-6">
            <load-datasets-card></load-datasets-card>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import LoadDatasetsCard from "./load-datasets-card";
    import SelectDatasetsCard from "./select-datasets-card";

    @Component({
        components: {LoadDatasetsCard, SelectDatasetsCard}
    })
    export default class Mpa extends Vue {
    };
</script>

<style scoped>

</style>

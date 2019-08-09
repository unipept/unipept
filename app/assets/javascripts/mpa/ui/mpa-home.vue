<template>
    <div class="row equal-height-row">
        <div class="col-md-6">
            <select-datasets-card style="min-height: 100%;"></select-datasets-card>
        </div>
        <div class="col-md-6">
            <load-datasets-card style="min-height: 100%;"></load-datasets-card>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import LoadDatasetsCard from "./load-datasets-card.vue";
    import SelectDatasetsCard from "./select-datasets-card.vue";

    @Component({
        components: {LoadDatasetsCard, SelectDatasetsCard}
    })
    export default class MpaHome extends Vue {
    };
</script>

<style scoped>

</style>

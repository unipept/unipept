<template>
    <load-datasets-card></load-datasets-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import LoadDatasetsCard from "./load-datasets-card";

    @Component({
        components: {LoadDatasetsCard}
    })
    export default class Mpa extends Vue {

    };
</script>

<style scoped>

</style>

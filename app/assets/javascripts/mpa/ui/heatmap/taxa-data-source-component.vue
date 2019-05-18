<template>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component, { mixins } from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import TaxaDataSource from "../../datasource/TaxaDataSource";
    import DataSourceComponent from "./data-source-component.vue";
    import DataSourceMixin from "./data-source-mixin.vue";

    @Component
    export default class TaxaDataSourceComponent extends mixins(DataSourceMixin) {
        
    }
</script>

<style scoped>
</style>
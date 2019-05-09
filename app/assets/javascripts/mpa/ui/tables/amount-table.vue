<template>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import { toCSVString } from "../../../utils";

    @Component
    export default class AmountTable extends Vue {
        public toCSV(columnNames: string[], columnValues: string[][]): string {
            columnValues.unshift(columnNames);
            return toCSVString(columnValues);
        }
    }
</script>

<style scoped>
</style>
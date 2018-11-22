<template>
    <div class="row equal-height-row">
        <div class="col-md-6">
            <experiment-summary-card></experiment-summary-card>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import SelectDatasetsCard from "./select-datasets-card.vue";
    import ExperimentSummaryCard from "./experiment-summary-card.vue";
    @Component({
        components: {ExperimentSummaryCard, SelectDatasetsCard}
    })
    export default class MpaAnalysis extends Vue {

    }
</script>

<style scoped>

</style>

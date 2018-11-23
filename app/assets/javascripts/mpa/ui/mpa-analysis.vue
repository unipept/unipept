<template>
    <div class="row equal-height-row">
        <div class="col-md-6">
            <switch-dataset-card></switch-dataset-card>
        </div>
        <div class="col-md-6">
            <experiment-summary-card></experiment-summary-card>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import ExperimentSummaryCard from "./experiment-summary-card.vue";
    import SwitchDatasetCard from "./switch-dataset-card.vue";

    @Component({
        components: {SwitchDatasetCard, ExperimentSummaryCard}
    })
    export default class MpaAnalysis extends Vue {

    }
</script>

<style scoped>

</style>

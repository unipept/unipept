<template>
    <div v-once>
        <div id="heatmap" ref="heatmapElement"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component, {mixins} from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {Heatmap} from "unipept-heatmap";
    import VisualizationMixin from "./visualization-mixin.vue";

    @Component
    export default class HeatmapVisualization extends mixins(VisualizationMixin) {
        mounted() {
            let heatmapElement: HTMLElement = <HTMLElement> this.$refs.heatmapElement;


            let heatmap = new Heatmap(heatmapElement, {
                rows: [],
                columns: [],
                values: []
            });
            heatmap.cluster();
        }
    }
</script>

<style scoped>
</style>

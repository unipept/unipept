<template>
    <div v-once>
        <div ref="heatmapElement"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component, {mixins} from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {Heatmap, HeatmapSettings} from "unipept-heatmap";
    
    import VisualizationMixin from "./visualization-mixin.vue";
    import Tree from "../../Tree";
    import Node from "../../Node";
    import {HeatmapData, HeatmapElement, HeatmapValue} from "unipept-heatmap/heatmap/input";
    import GOTerms from "../../../fa/old-goterms";
    import Resultset from "../../Resultset";

    @Component
    export default class HeatmapVisualization extends mixins(VisualizationMixin) {
        @Prop({default: false}) 
        private fullScreen: false;
        @Prop({required: true})
        private data: HeatmapData;
        @Prop({required: false, default: true})
        private clusterRows: boolean;
        @Prop({required: false, default: true})
        private clusterColumns: boolean;

        private heatmap: Heatmap;

        mounted() {
            this.initHeatmap();
        }

        reset() {
            if (this.heatmap){
                this.heatmap.reset();
            }
        }

        @Watch('fullScreen') onFullScreenChanged(newFullScreen: boolean, oldFullScreen: boolean) {
            this.heatmap.setFullScreen(newFullScreen)
        }

        @Watch("data")
        private onDataChanged() {
            this.initHeatmap();
        }

        @Watch("clusterRows")
        @Watch("clusterColumns")
        async compute() {
            this.initHeatmap();
        }

        private async initHeatmap() {
            if (this.data) {
                // let settings: HeatmapSettings = new HeatmapSettings();
                // settings.getTooltip = (cell: HeatmapValue, row: HeatmapElement, column: HeatmapElement) =>
                    // `<b>${row.name}</b><br>Absolute count: ${rowMappings[row.idx][column.idx].absoluteCount}<br>${rowMappings[row.idx][column.idx].numberOfPepts} matched peptides`;
                let heatmapElement: HTMLElement = <HTMLElement> this.$refs.heatmapElement;
                this.heatmap = new Heatmap(heatmapElement, this.data);

                let clusterType: "all" | "columns" | "rows" | "none" = "all";
                if (this.clusterRows && !this.clusterColumns) {
                    clusterType = "rows";
                } else if (!this.clusterRows && this.clusterColumns) {
                    clusterType = "columns";
                } else if (!this.clusterRows && !this.clusterColumns) {
                    clusterType = "none";
                }
                this.heatmap.cluster(clusterType);
            }
        }
    }
</script>

<style scoped>
</style>

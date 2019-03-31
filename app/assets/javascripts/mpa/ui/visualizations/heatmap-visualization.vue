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
    import {Tree} from "../../tree";
    import {Node} from "../../node";
    import {HeatmapData, HeatmapElement, HeatmapValue} from "unipept-heatmap/heatmap/input";
    import GOTerms from "../../../fa/goterms";
    import Resultset from "../../Resultset";

    @Component
    export default class HeatmapVisualization extends mixins(VisualizationMixin) {
        private heatmap: Heatmap;

        mounted() {
            this.initHeatmap();
        }

        reset() {
            if (this.heatmap){
                this.heatmap.reset();
            }
        }

        @Watch('dataset') onDatasetChanged() {
            this.initHeatmap();
        }

        private async initHeatmap() {
            if (this.dataset != null && this.dataset.getDataset() != null) {
                let heatmapElement: HTMLElement = <HTMLElement> this.$refs.heatmapElement;

                let tree: Tree = this.dataset.getDataset().getTree();
                let nodes: Node[] = tree.getNodesAtDepth(2);

                let resultset: Resultset = this.dataset.getDataset().resultSet;
                await resultset.processFA();
                let go: GOTerms = await resultset.summarizeGo();
                let topGos = go._childeren["biological process"]["_data"].slice(0, 20);

                let rows: HeatmapElement[] = [];
                let cols: HeatmapElement[] = [];

                for (let go of topGos) {
                    cols.push({
                        name: go["code"]
                    })
                }

                let grid: number[][] = [];

                for (let node of nodes) {
                    let row: HeatmapElement = {
                        name: node.name
                    };

                    rows.push(row);

                    let processedGo: GOTerms = await resultset.summarizeGo(50, tree.getAllSequences(node.id));
                    let rowValues = [];
                    for (let go of topGos) {
                        let val: number = this.getGoCount(processedGo._childeren["biological process"]["_data"], go["code"]);
                        rowValues.push(val);
                    }

                    console.log(rowValues);
                    grid.push(rowValues);
                }


                // Normalize values to be clustered
                for (let row of grid) {
                    let minValue = Math.min(...row);
                    let maxValue = Math.max(...row);

                    if (maxValue != 0){
                        for (let i = 0; i < row.length; i++) {
                            row[i] = (row[i] - minValue) / maxValue;
                        }
                    }
                }

                this.heatmap = new Heatmap(heatmapElement, {
                    rows: rows,
                    columns: cols,
                    values: grid
                });
                this.heatmap.cluster();
            }
        }

        private getGoCount(goValues, goTerm: string): number {
            for (let go of goValues) {
                if (go["code"] === goTerm) {
                    return go["absoluteCount"];
                }
            }
            return 0;
        }
    }
</script>

<style scoped>
</style>

<template>
    <div>
        <h2 class="ghead">
            <span class="dir">
                <a class="btn btn-xs btn-default btn-animate" @click="reset()" title="reset visualisation">
                    <span class="glyphicon glyphicon-repeat spin"></span>
                </a>
            </span>
            <span class="dir text">Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root</span>
        </h2>
        <div v-once ref="visualization"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component, {mixins} from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import PeptideContainer from "../../PeptideContainer";
    import Tree from "../../Tree";
    import {tooltipContent} from "./VisualizationHelper";
    import VisualizationMixin from "./visualization-mixin.vue";

    @Component
    export default class TreeviewVisualization extends mixins(VisualizationMixin) {
        treeview!: any;

        @Prop({default: false}) fullScreen: boolean;

        mounted() {
            this.initTreeview();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initTreeview();
        }

        @Watch('watchableTaxonId') onWatchableTaxonIdChanged() {
            if (this.watchableTaxonId === -1) {
                this.reset();
            }
        }

        @Watch('fullScreen') onFullScreenChanged(newFullScreen: boolean, oldFullScreen: boolean) {
            this.treeview.setFullScreen(newFullScreen)
        }

        reset() {
            if (this.treeview) {
                this.treeview.reset();
            }
        }

        private initTreeview() {
            if (this.dataset != null && this.dataset.getDataset() != null) {
                let tree: Tree = this.dataset.getDataset().getTree();
                const data = JSON.stringify(tree.getRoot());

                this.treeview = $(this.$refs.visualization).html("").treeview(JSON.parse(data), {
                    width: 916,
                    height: 600,
                    getTooltip: tooltipContent,
                    enableAutoExpand: true,
                    colors: d => {
                        if (d.name === "Bacteria") return "#1565C0"; // blue
                        if (d.name === "Archaea") return "#FF8F00"; // orange
                        if (d.name === "Eukaryota") return "#2E7D32"; // green
                        if (d.name === "Viruses") return "#C62828"; // red
                        return d3.scale.category10().call(this, d);
                    },
                    rerootCallback: d => this.search(d.id, d.name, 1000)
                });
            }
        }
    }
</script>

<style scoped>

</style>

<template>
    <div>
        <h2 class="ghead">
            <span class="dir">
                <a class="btn btn-xs btn-default btn-animate" id="treeview-reset" title="reset visualisation">
                    <span class="glyphicon glyphicon-repeat spin"></span>
                </a>
            </span>
            <span class="dir text">Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root</span>
        </h2>
        <div ref="visualization"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import NewPeptideContainer from "../../NewPeptideContainer";
    import {Tree} from "../../tree";
    import {tooltipContent} from "./VisualizationHelper";

    @Component
    export default class TreeviewVisualization extends Vue {
        @Prop({default: null}) dataset: NewPeptideContainer | null;

        mounted() {
            this.initTreeview();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initTreeview();
        }

        private initTreeview() {
            if (this.dataset != null && this.dataset.getDataset() != null) {
                let tree: Tree = this.dataset.getDataset().getTree();
                const data = JSON.stringify(tree.getRoot());

                $(this.$refs.visualization).html("").treeview(JSON.parse(data), {
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
                    }
                });
            }
        }
    }
</script>

<style scoped>

</style>

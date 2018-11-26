<template>
    <div>
        <h2 class="ghead">
            <span class="dir">
                <a class="btn btn-xs btn-default btn-animate" id="treemap-reset" title="reset visualisation">
                    <span class="glyphicon glyphicon-repeat spin"></span>
                </a>
            </span>
            <span class="dir text">Click a square to zoom in and right click to zoom out</span>
        </h2>
        <div ref="visualization"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import NewPeptideContainer from "../../NewPeptideContainer";
    import MpaAnalysisManager from "../../MpaAnalysisManager";
    import {Tree} from "../../tree";
    import {tooltipContent} from "./VisualizationHelper";

    @Component
    export default class TreemapVisualization extends Vue {
        @Prop({default: null}) dataset: NewPeptideContainer | null;

        mounted() {
            this.initTreeMap();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initTreeMap();
        }

        private initTreeMap() {
            if (this.dataset != null && this.dataset.getDataset() != null) {
                let tree: Tree = this.dataset.getDataset().getTree();
                const data = JSON.stringify(tree.getRoot());

                $(this.$refs.visualization).treemap(JSON.parse(data), {
                    width: 916,
                    height: 600,
                    levels: 28,
                    getBreadcrumbTooltip: d => d.rank,
                    getTooltip: tooltipContent,
                    getLabel: d => `${d.name} (${d.data.self_count}/${d.data.count})`,
                    getLevel: d => MpaAnalysisManager.RANKS.indexOf(d.rank)
                });
            }
        }
    }
</script>

<style scoped>

</style>

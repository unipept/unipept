<template>
    <div>
        <h2 class="ghead">
            <span class="dir">
                <a class="btn btn-xs btn-default btn-animate" @click="reset()" title="reset visualisation">
                    <span class="glyphicon glyphicon-repeat spin"></span>
                </a>
            </span>
            <span class="dir text">Click a square to zoom in and right click to zoom out</span>
        </h2>
        <div v-once ref="visualization"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component, {mixins} from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Assay from "../../assay/Assay";
    import MpaAnalysisManager from "../../MpaAnalysisManager";
    import Tree from "../../Tree";
    import {tooltipContent} from "./VisualizationHelper";
    import VisualizationMixin from "./visualization-mixin.vue";
    import TaxaDataSource from "./../../datasource/TaxaDataSource";
    import { TaxumRank } from "../../datasource/TaxumRank";

    @Component
    export default class TreemapVisualization extends mixins(VisualizationMixin) {
        // Make field non-reactive by not setting the value here, but only after created() has been fired.
        treemap!: any;

        @Prop({default: false}) 
        private fullScreen: boolean;

        mounted() {
            this.initTreeMap();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initTreeMap();
        }

        @Watch('watchableTaxonId') onWatchableTaxonIdChanged() {
            if (this.watchableTaxonId === -1) {
                this.reset();
            }
        }

        @Watch('fullScreen')
        private onFullScreenChanged(isFullScreen: boolean) {
            this.treemap.setFullScreen(isFullScreen);
        }

        reset() {
            if (this.treemap) {
                this.treemap.reset();
            }
        }

        private async initTreeMap() {
            if (this.dataset != null && this.dataset.dataRepository != null) {
                let taxaSource: TaxaDataSource = await this.dataset.dataRepository.createTaxaDataSource();
                let tree: Tree = await taxaSource.getTree();
                const data = JSON.stringify(tree.getRoot());

                this.treemap = $(this.$refs.visualization).treemap(JSON.parse(data), {
                    width: 916,
                    height: 600,
                    levels: 28,
                    getBreadcrumbTooltip: d => d.rank,
                    getTooltip: tooltipContent,
                    getLabel: d => `${d.name} (${d.data.self_count}/${d.data.count})`,
                    getLevel: d => Object.values(TaxumRank).indexOf(d.rank),
                    rerootCallback: d => this.search(d.id, d.name, 1000)
                });
            }
        }
    }
</script>

<style scoped>
</style>

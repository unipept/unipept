<template>
    <div>
        <h2 class="ghead">
            <span class="dir">
                <a class="btn btn-xs btn-default btn-animate" @click="reset()" title="reset visualisation"><span class="glyphicon glyphicon-repeat spin"></span></a>
            </span>
            <span class="dir">
                <div class="btn-group" id="colorswap">
                    <a class="btn btn-xs btn-default dropdown-toggle" data-toggle="dropdown" id="colorswap-button"><span class="glyphicon glyphicon-cog"></span></a>
                    <ul class="dropdown-menu dropdown-menu-right dropdown-menu-form">
                        <li title="Enabling this will assign fixed colors to taxa making it easier to compare samples.">
                            <div class="checkbox">
                                <label class="checkbox">
                                    <input type="checkbox" id="colorswap-checkbox" v-model="isFixedColors">Use fixed colors
                                </label>
                            </div>
                        </li>
                    </ul>
                </div>
            </span>
            <span class="dir text">Click a slice to zoom in and the center node to zoom out</span>
        </h2>
        <div v-once ref="visualization"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component, {mixins} from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Tree from "../../Tree";
    import PeptideContainer from "../../PeptideContainer";
    import {tooltipContent} from "./VisualizationHelper";
    import VisualizationMixin from "./visualization-mixin.vue";
    import TaxaDataSource from "../../datasource/TaxaDataSource";

    @Component
    export default class SunburstVisualization extends mixins(VisualizationMixin) {
        // Make field non-reactive by not setting it here, but only after created has been called for the first time.
        sunburst!: any;

        isFixedColors: boolean = false;

        @Prop({default: false}) fullScreen: false;

        mounted() {
            this.initTree();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initTree();
        }

        @Watch('watchableTaxonId') onWatchableTaxonIdChanged() {
            if (this.watchableTaxonId === -1) {
                this.reset();
            }
        }

        @Watch('fullScreen') onFullScreenChanged(newFullScreen: boolean, oldFullScreen: boolean) {
            this.sunburst.setFullScreen(newFullScreen)
        }

        @Watch('isFixedColors') onIsFixedColorsChanged(newFixedColors: boolean, oldFixedColors: boolean) {
            this.sunburst.settings.useFixedColors = newFixedColors;
            this.sunburst.redrawColors();
        }

        reset() {
            if (this.sunburst) {
                this.sunburst.reset();
            }
        }

        private async initTree() {
            if (this.dataset != null && this.dataset.getDataset() != null) {
                let taxaDataSource: TaxaDataSource = await this.dataset.getDataset().dataRepository.createTaxaDataSource();
                let tree: Tree = await taxaDataSource.getTree();
                const data = JSON.stringify(tree.getRoot());

                this.sunburst = $(this.$refs.visualization).sunburst(JSON.parse(data), {
                    width: 740,
                    height: 740,
                    radius: 740 / 2,
                    getTooltip: tooltipContent,
                    getTitleText: d => `${d.name} (${d.rank})`,
                    rerootCallback: d => this.search(d.id, d.name, 1000),
                });
            }
        }
    }
</script>

<style scoped>

</style>

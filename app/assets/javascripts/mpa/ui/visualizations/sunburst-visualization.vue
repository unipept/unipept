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
                            <div class="checkbox"><label class="checkbox"><input type="checkbox" id="colorswap-checkbox">Use fixed colors</label></div>
                        </li>
                    </ul>
                </div>
            </span>
            <span class="dir text">Click a slice to zoom in and the center node to zoom out</span>
        </h2>
        <div ref="visualization"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {Tree} from "../../tree";
    import NewPeptideContainer from "../../NewPeptideContainer";
    import {tooltipContent} from "./VisualizationHelper";

    @Component
    export default class SunburstVisualization extends Vue {
        @Prop({default: null}) dataset: NewPeptideContainer | null;

        // Make field non-reactive by not setting it here, but only after created has been called for the first time.
        sunburst!: any;

        mounted() {
            this.initTree();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initTree();
        }

        reset() {
            if (this.sunburst) {
                this.sunburst.reset();
            }
        }

        private initTree() {
            if (this.dataset != null && this.dataset.getDataset() != null) {
                let tree: Tree = this.dataset.getDataset().getTree();
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

        /**
         * Propagate selections in the visualisation to the search tree and
         * The functional analysis data.
         *
         * @param id Taxon id to inspect
         * @param searchTerm Search term to put in box
         * @param [timeout=500] timeout in ms to wait before processing
         * @todo add search term to FA explanation to indicate filtering
         */
        private search(id: number, searchTerm, timeout = 500) {
            let localTerm = searchTerm;
            if (localTerm === "Organism") {
                localTerm = "";
            }
            setTimeout(() => {
                this.$store.dispatch('setSelectedTerm', localTerm);
            });
        }
    }
</script>

<style scoped>

</style>

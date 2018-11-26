<template>
    <card-nav>
        <tab label="Sunburst" :active="true" id="sunburstWrapper">
            <div v-if="this.$store.getters.activeDataset">
                <h2 class="ghead">
                    <span class="dir">
                        <a class="btn btn-xs btn-default btn-animate" id="sunburst-reset" title="reset visualisation"><span class="glyphicon glyphicon-repeat spin"></span></a>
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
                <sunburst-visualization :dataset="$store.getters.activeDataset"></sunburst-visualization>
            </div>
            <div v-else>
                <div class="mpa-waiting">
                    <img alt="Please wait while we are preparing your data..." class="mpa-placeholder" src="/images/mpa/placeholder_sunburst.svg">
                </div>
            </div>
        </tab>
        <tab label="Treemap" id="treemapWrapper">
            <div v-if="this.$store.getters.activeDataset">
                <h2 class="ghead">
                    <span class="dir">
                        <a class="btn btn-xs btn-default btn-animate" id="treemap-reset" title="reset visualisation">
                            <span class="glyphicon glyphicon-repeat spin"></span>
                        </a>
                    </span>
                    <span class="dir text">Click a square to zoom in and right click to zoom out</span>
                </h2>
                <treemap-visualization :dataset="$store.getters.activeDataset"></treemap-visualization>
            </div>
            <div v-else>
                <div class="mpa-waiting">
                    <img alt="Please wait while we are preparing your data..." class="mpa-placeholder" src="/images/mpa/placeholder_treemap.svg">
                </div>
            </div>
        </tab>
        <tab label="Treeview" id="treeviewWrapper">
            <div v-if="this.$store.getters.activeDataset">
                <h2 class="ghead">
                    <span class="dir">
                        <a class="btn btn-xs btn-default btn-animate" id="treeview-reset" title="reset visualisation">
                            <span class="glyphicon glyphicon-repeat spin"></span>
                        </a>
                    </span>
                    <span class="dir text">Scroll to zoom, drag to pan, click a node to expand, right click a node to set as root</span>
                </h2>
                <treeview-visualization :dataset="$store.getters.activeDataset"></treeview-visualization>
            </div>
            <div v-else>
                <div class="mpa-waiting">
                    <img alt="Please wait while we are preparing your data..." class="mpa-placeholder" src="/images/mpa/placeholder_treeview.svg">
                </div>
            </div>
        </tab>
        <tab label="Hierarchical outline" class="card-supporting-text">
            <hierarchical-outline-visualization :dataset="$store.getters.activeDataset"></hierarchical-outline-visualization>
        </tab>
    </card-nav>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import CardNav from "../../components/card/card-nav.vue";
    import Tab from "../../components/card/tab.vue";
    import SunburstVisualization from "./visualizations/sunburst-visualization.vue";
    import TreemapVisualization from "./visualizations/treemap-visualization.vue";
    import TreeviewVisualization from "./visualizations/treeview-visualization.vue";
    import SimpleButton from "../../components/button/simple-button.vue";
    import HierarchicalOutlineVisualization from "./visualizations/hierarchical-outline-visualization.vue";

    @Component({
        components: {
            HierarchicalOutlineVisualization,
            SimpleButton, TreeviewVisualization, TreemapVisualization, SunburstVisualization, CardNav, Tab}
    })
    export default class SingleDatasetVisualizationsCard extends Vue {

    }
</script>

<style scoped>

</style>

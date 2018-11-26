<template>
    <card-nav>
        <tab label="Sunburst" :active="true" id="sunburstWrapper">
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
        </tab>
        <tab label="Treemap" id="treemapWrapper">
            <treemap-visualization :dataset="$store.getters.activeDataset"></treemap-visualization>
        </tab>
        <tab label="Treeview" id="treeviewWrapper">
            <treeview-visualization :dataset="$store.getters.activeDataset"></treeview-visualization>
        </tab>
        <tab label="Hierarchical outline">
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

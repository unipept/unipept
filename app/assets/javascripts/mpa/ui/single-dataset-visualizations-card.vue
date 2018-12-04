<template>
    <card-nav>
        <card-header class="card-title-interactive">
            <ul class="nav nav-tabs">
                <li v-for="tab in tabs" v-if="tab.constructor.name === 'Tab'" v-bind:class="{ active: tab.activated }" @click="changeActiveTab(tab)">
                    <a>{{ tab.label }}</a>
                </li>
            </ul>
            <div class="nav-right">
                <div style="position: relative; top: 4px;">
                    <button id="zoom-btn" class="btn btn-default btn-xs btn-animate"><span class="glyphicon glyphicon-resize-full grow"></span> Enter full screen</button>
                    <button id="save-btn" class="btn btn-default btn-xs btn-animate"><span class="glyphicon glyphicon-download down"></span> Save as image</button>
                </div>
            </div>
        </card-header>

        <card-body>
            <div class="tab-content">
                <tab label="Sunburst" :active="true" id="sunburstWrapper">
                    <sunburst-visualization v-if="$store.getters.activeDataset" :dataset="$store.getters.activeDataset"></sunburst-visualization>
                    <div v-else class="mpa-waiting">
                        <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_sunburst.svg">
                    </div>
                </tab>
                <tab label="Treemap" id="treemapWrapper">
                    <treemap-visualization v-if="$store.getters.activeDataset" :dataset="$store.getters.activeDataset"></treemap-visualization>
                    <div v-else class="mpa-waiting">
                        <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_treemap.svg">
                    </div>
                </tab>
                <tab label="Treeview" id="treeviewWrapper">
                    <treeview-visualization v-if="$store.getters.activeDataset" :dataset="$store.getters.activeDataset"></treeview-visualization>
                    <div v-else class="mpa-waiting">
                        <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_treeview.svg">
                    </div>
                </tab>
                <tab label="Hierarchical outline" class="card-supporting-text">
                    <hierarchical-outline-visualization v-if="$store.getters.activeDataset" :dataset="$store.getters.activeDataset"></hierarchical-outline-visualization>
                    <div v-else>
                        {{ waitString }}
                    </div>
                </tab>
            </div>
        </card-body>
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
    import Tabs from "../../components/card/tabs.vue";
    import CardHeader from "../../components/card/card-header.vue";
    import CardBody from "../../components/card/card-body.vue";

    @Component({
        components: {
            CardBody,
            CardHeader,
            Tabs,
            HierarchicalOutlineVisualization,
            SimpleButton, TreeviewVisualization, TreemapVisualization, SunburstVisualization, CardNav, Tab},
        computed: {
            datasetsChosen: {
                get(): boolean {
                    return this.$store.getters.selectedDatasets.length > 0;
                }
            }
        }
    })
    export default class SingleDatasetVisualizationsCard extends Vue {
        waitString = "Please wait while we are preparing your data...";
        tabs: Tab[] = [];

        mounted() {
            this.tabs = this.$children[0].$children[1].$children as Tab[];
        }

        @Watch('datasetsChosen') onDatasetsChosenChanged(newValue: boolean, oldValue: boolean) {
            if (newValue) {
                this.waitString = "Please wait while we are preparing your data...";
            } else {
                this.waitString = "Please select at least one dataset to continue the analysis...";
            }
            console.log(this.waitString);
        }
    }
</script>

<style scoped>

</style>

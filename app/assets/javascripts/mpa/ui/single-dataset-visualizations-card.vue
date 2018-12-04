<template>
    <card-nav>
        <card-header class="card-title-interactive">
            <ul class="nav nav-tabs">
                <li v-for="tab in tabs" v-bind:class="{ active: tab.activated }" @click="changeActiveTab(tab)">
                    <a>{{ tab.label }}</a>
                </li>
            </ul>
            <div class="nav-right">
                <div style="position: relative; top: 4px;">
                    <button id="zoom-btn" class="btn btn-default btn-xs btn-animate" @click="switchToFullScreen()"><span class="glyphicon glyphicon-resize-full grow"></span> Enter full screen</button>
                    <button id="save-btn" class="btn btn-default btn-xs btn-animate"><span class="glyphicon glyphicon-download down"></span> Save as image</button>
                </div>
            </div>
        </card-header>

        <card-body class="multi-results">
            <div class="tab-content full-screen-container multi-search" :class="[isFullScreen ? 'full-screen' : 'not-full-screen']" ref="fullScreenContainer">
                <div class="full-screen-bar">
                    <div class="logo"><img src="/images/trans_logo.png" alt="logo" width="40" height="40"></div>
                    <nav class="fullScreenNav">
                        <ul class="visualisations">
                            <li v-for="tab in tabs" v-bind:class="{ active: tab.activated }" @click="changeActiveTab(tab)">
                                <a>{{ tab.label }}</a>
                            </li>
                        </ul>
                    </nav>
                    <div class="fullScreenActions">
                        <a title="" class="btn-animate reset" data-original-title="Reset the visualisation"><span class="glyphicon glyphicon-repeat spin"></span></a>
                        <a title="" class="btn-animate download" data-original-title="Download the current view as an svg or png image"><span class="glyphicon glyphicon-download down"></span></a>
                        <a title="" class="btn-animate exit" data-original-title="Exit full screen mode"><span class="glyphicon glyphicon-resize-small shrink"></span></a>
                    </div>
                </div>
                <tab label="Sunburst" :active="true" id="sunburstWrapper" class="visualization-wrapper">
                    <sunburst-visualization :full-screen="isFullScreen" class="unipept-sunburst" v-if="$store.getters.activeDataset" :dataset="$store.getters.activeDataset"></sunburst-visualization>
                    <div v-else class="mpa-waiting">
                        <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_sunburst.svg">
                    </div>
                </tab>
                <tab label="Treemap" id="treemapWrapper" class="visualization-wrapper">
                    <treemap-visualization :full-screen="isFullScreen" v-if="$store.getters.activeDataset" :dataset="$store.getters.activeDataset"></treemap-visualization>
                    <div v-else class="mpa-waiting">
                        <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_treemap.svg">
                    </div>
                </tab>
                <tab label="Treeview" id="treeviewWrapper" class="visualization-wrapper">
                    <treeview-visualization :full-screen="isFullScreen" v-if="$store.getters.activeDataset" :dataset="$store.getters.activeDataset"></treeview-visualization>
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
    import {logToGoogle} from "../../utils";

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
        isFullScreen: boolean = false;

        mounted() {
            this.tabs = this.$children[0].$children[1].$children as Tab[];
            $(document).bind(window.fullScreenApi.fullScreenEventName, () => this.exitFullScreen());
        }

        @Watch('datasetsChosen') onDatasetsChosenChanged(newValue: boolean, oldValue: boolean) {
            if (newValue) {
                this.waitString = "Please wait while we are preparing your data...";
            } else {
                this.waitString = "Please select at least one dataset to continue the analysis...";
            }
            console.log(this.waitString);
        }

        changeActiveTab(tab: Tab) {
            for (let currentTab of this.tabs) {
                currentTab.activated = false;
            }

            tab.activated = true;
        }

        switchToFullScreen() {
            if (window.fullScreenApi.supportsFullScreen) {
                this.isFullScreen = true;
                window.fullScreenApi.requestFullScreen(this.$refs.fullScreenContainer);
            }
        }

        exitFullScreen() {
            if (!window.fullScreenApi.isFullScreen()) {
                this.isFullScreen = false;
            }
        }
    }
</script>

<style scoped>

</style>

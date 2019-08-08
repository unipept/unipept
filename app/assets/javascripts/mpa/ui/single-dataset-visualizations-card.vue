<template>
    <card-nav>
        <card-header class="card-title-interactive">
            <ul class="nav nav-tabs">
                <li v-for="tab in tabs" v-bind:class="{ active: tab.activated }" v-bind:key="tab.label" @click="changeActiveTab(tab)">
                    <a>{{ tab.label }}</a>
                </li>
                <li @click="openHeatmapWizard()">
                    <a>Heatmap</a>
                </li>
            </ul>
            <div class="nav-right">
                <div style="position: relative; top: 4px;">
                    <button id="zoom-btn" class="btn btn-default btn-xs btn-animate" @click="switchToFullScreen()"><span class="glyphicon glyphicon-resize-full grow"></span> Enter full screen</button>
                    <button id="save-btn" class="btn btn-default btn-xs btn-animate" @click="saveAsImage()"><span class="glyphicon glyphicon-download down"></span> Save as image</button>
                </div>
            </div>
        </card-header>

        <card-body class="multi-results">
            <div class="tab-content full-screen-container multi-search" :class="[isFullScreen ? 'full-screen' : 'not-full-screen']" ref="fullScreenContainer">
                <div class="full-screen-bar">
                    <div class="logo">
                        <img src="/images/trans_logo.png" alt="logo" width="40" height="40">
                    </div>
                    <nav class="fullScreenNav">
                        <ul class="visualisations">
                            <li v-for="tab in tabs" v-bind:class="{ active: tab.activated }" v-bind:key="tab.label" @click="changeActiveTab(tab)">
                                <a>{{ tab.label }}</a>
                            </li>
                        </ul>
                    </nav>
                    <div class="fullScreenActions">
                        <a title="" class="btn-animate reset" data-original-title="Reset the visualisation" @click="reset()"><span class="glyphicon glyphicon-repeat spin"></span></a>
                        <a title="" class="btn-animate download" data-original-title="Download the current view as an svg or png image" @click="saveAsImage()"><span class="glyphicon glyphicon-download down"></span></a>
                        <a title="" class="btn-animate exit" data-original-title="Exit full screen mode" @click="cancelFullScreen()"><span class="glyphicon glyphicon-resize-small shrink"></span></a>
                    </div>
                </div>
                <tab label="Sunburst" :active="true" id="sunburstWrapper" class="visualization-wrapper">
                    <sunburst-visualization ref="sunburst" :full-screen="isFullScreen" class="unipept-sunburst" v-if="$store.getters.activeDataset && $store.getters.activeDataset.progress === 1" :dataset="$store.getters.activeDataset"></sunburst-visualization>
                    <div v-else class="mpa-waiting">
                        <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_sunburst.svg">
                    </div>
                </tab>
                <tab label="Treemap" id="treemapWrapper" class="visualization-wrapper">
                    <treemap-visualization ref="treemap" id="treemap" :full-screen="isFullScreen" v-if="$store.getters.activeDataset && $store.getters.activeDataset.progress === 1" :dataset="$store.getters.activeDataset"></treemap-visualization>
                    <div v-else class="mpa-waiting">
                        <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_treemap.svg">
                    </div>
                </tab>
                <tab label="Treeview" id="treeviewWrapper" class="visualization-wrapper">
                    <treeview-visualization ref="treeview" :full-screen="isFullScreen" v-if="$store.getters.activeDataset && $store.getters.activeDataset.progress === 1" :dataset="$store.getters.activeDataset"></treeview-visualization>
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

            <template v-for="dataset of $store.getters.selectedDatasets">
                <v-dialog v-model="dialogOpen" width="1000px" :key="dataset.id" v-if="dataset && $store.getters.activeDataset && dataset.id === $store.getters.activeDataset.id">
                    <div style="min-height: 600px; background-color: white;">
                        <div class="modal-header">
                            <button type="button" class="close" @click="dialogOpen = false"><span aria-hidden="true">×</span></button>
                            <h4 class="modal-title">Heatmap wizard</h4>
                        </div>
                        <div class="single-dataset-wizard">
                            <heatmap-wizard-single-sample v-if="dataset" :dataset="dataset"></heatmap-wizard-single-sample>
                            <div v-else>
                                <div class="text-xs-center" style="margin-top: 25px;">
                                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                                </div>
                            </div>
                        </div>
                    </div>
                </v-dialog>
            </template>
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
    import HierarchicalOutlineVisualization from "./visualizations/hierarchical-outline-visualization.vue";
    import Tabs from "../../components/card/tabs.vue";
    import CardHeader from "../../components/card/card-header.vue";
    import CardBody from "../../components/card/card-body.vue";
    import {logToGoogle, triggerDownloadModal} from "../../utils";
    import HeatmapVisualization from "./visualizations/heatmap-visualization.vue";
    import PeptideContainer from "../PeptideContainer";
    import HeatmapWizardSingleSample from "./heatmap/heatmap-wizard-single-sample.vue";

    @Component({
        components: {
            HeatmapVisualization,
            CardBody,
            CardHeader,
            Tabs,
            HierarchicalOutlineVisualization,
            TreeviewVisualization,
            TreemapVisualization,
            SunburstVisualization,
            CardNav,
            Tab,
            HeatmapWizardSingleSample
        },
        computed: {
            datasetsChosen: {
                get(): boolean {
                    return this.$store.getters.selectedDatasets.length > 0;
                }
            }
        }
    })
    export default class SingleDatasetVisualizationsCard extends Vue {
        private waitString = "Please wait while we are preparing your data...";
        private tabs: Tab[] = [];
        private isFullScreen: boolean = false;

        private dialogOpen: boolean = false;

        mounted() {
            this.tabs = (this.$children[0].$children[1].$children as Tab[]).slice(0, -1);
            $(document).bind(window.fullScreenApi.fullScreenEventName, () => this.exitFullScreen());
            $(".fullScreenActions a").tooltip({placement: "bottom", delay: {"show": 300, "hide": 300}});
        }

        @Watch('datasetsChosen') onDatasetsChosenChanged(newValue: boolean, oldValue: boolean) {
            if (newValue) {
                this.waitString = "Please wait while we are preparing your data...";
            } else {
                this.waitString = "Please select at least one dataset to continue the analysis...";
            }
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
                let activatedTab = this.tabs.filter(tab => tab.activated)[0];
                logToGoogle("Multi Peptide", "Full Screen", activatedTab.label);
                window.fullScreenApi.requestFullScreen(this.$refs.fullScreenContainer);

                $(".tip").appendTo(".full-screen-container");
            }
        }

        cancelFullScreen() {
            window.fullScreenApi.cancelFullScreen();
        }

        exitFullScreen() {
            if (!window.fullScreenApi.isFullScreen()) {
                this.isFullScreen = false;
                $(".tip").appendTo("body");
            }
        }

        reset() {
            (this.$refs.sunburst as SunburstVisualization).reset();
            (this.$refs.treeview as TreeviewVisualization).reset();
            (this.$refs.treemap as TreemapVisualization).reset();
            (this.$refs.heatmap as HeatmapVisualization).reset();
        }

        saveAsImage() {
            let activeTab = "";
            for (let tab of this.tabs) {
                if (tab.activated) {
                    activeTab = tab.label;
                }
            }

            let activatedTab = this.tabs.filter(tab => tab.activated)[0];
            logToGoogle("Multi Peptide", "Save Image", activatedTab.label);
            if (activeTab === "Sunburst") {
                d3.selectAll(".toHide").attr("class", "arc hidden");
                triggerDownloadModal("#sunburstWrapper svg", null, "unipept_sunburst");
                d3.selectAll(".hidden").attr("class", "arc toHide");
            } else if (activeTab === "Treemap") {
                triggerDownloadModal(null, "#treemap", "unipept_treemap");
            } else {
                triggerDownloadModal("#treeviewWrapper svg", null, "unipept_treeview");
            }
        }

        private openHeatmapWizard(): void {
            this.dialogOpen = true;
        }
    }
</script>

<style scoped>

</style>

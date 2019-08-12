<template>
    <v-card style="overflow: hidden;">
        <div class="fullscreen-nav">
            <button id="zoom-btn" class="btn btn-default btn-xs btn-animate" @click="switchToFullScreen()"><span class="glyphicon glyphicon-resize-full grow"></span> Enter full screen</button>
            <button id="save-btn" class="btn btn-default btn-xs btn-animate" @click="saveAsImage()"><span class="glyphicon glyphicon-download down"></span> Save as image</button>
        </div>
        <div class="tab-content full-screen-container multi-search" :class="[isFullScreen ? 'full-screen' : 'not-full-screen']" ref="fullScreenContainer">
            <div class="full-screen-bar">
                <div class="logo">
                    <img src="/images/trans_logo.png" alt="logo" width="40" height="40">
                </div>
                <nav class="fullScreenNav">
                    <dataset-visualizations tab-color="accent" :full-screen="isFullScreen" :fixed-tabs="true" :heatmap="false">
                    </dataset-visualizations>

                    <!-- <ul class="visualisations">

                        <li v-for="tab in tabs" v-bind:class="{ active: tab.activated }" v-bind:key="tab.label" @click="changeActiveTab(tab)">
                            <a>{{ tab.label }}</a>
                        </li>
                    </ul> -->
                </nav>
                <div class="fullScreenActions">
                    <a title="" class="btn-animate reset" data-original-title="Reset the visualisation" @click="reset()"><span class="glyphicon glyphicon-repeat spin"></span></a>
                    <a title="" class="btn-animate download" data-original-title="Download the current view as an svg or png image" @click="saveAsImage()"><span class="glyphicon glyphicon-download down"></span></a>
                    <a title="" class="btn-animate exit" data-original-title="Exit full screen mode" @click="cancelFullScreen()"><span class="glyphicon glyphicon-resize-small shrink"></span></a>
                </div>
            </div>
        </div>
        <dataset-visualizations tab-color="primary" :full-screen="isFullScreen">
        </dataset-visualizations>        
    </v-card>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import SunburstVisualization from "./sunburst-visualization.vue";
    import TreemapVisualization from "./treemap-visualization.vue";
    import TreeviewVisualization from "./treeview-visualization.vue";
    import HierarchicalOutlineVisualization from "./hierarchical-outline-visualization.vue";
    import CardHeader from "../../../components/card/card-header.vue";
    import {logToGoogle, triggerDownloadModal} from "../../../utils";
    import HeatmapVisualization from "./heatmap-visualization.vue";
    import PeptideContainer from "../../PeptideContainer";
    import HeatmapWizardSingleSample from "./../heatmap/heatmap-wizard-single-sample.vue";
    import DatasetVisualizations from "./dataset-visualizations.vue";

    @Component({
        components: {
            HeatmapVisualization,
            CardHeader,
            HierarchicalOutlineVisualization,
            TreeviewVisualization,
            TreemapVisualization,
            SunburstVisualization,
            HeatmapWizardSingleSample,
            DatasetVisualizations
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
        private isFullScreen: boolean = false;

        mounted() {
            $(document).bind(window.fullScreenApi.fullScreenEventName, () => this.exitFullScreen());
            $(".fullScreenActions a").tooltip({placement: "bottom", delay: {"show": 300, "hide": 300}});
        }

        switchToFullScreen() {
            // TODO needs to be re-implemented
            if (window.fullScreenApi.supportsFullScreen) {
                this.isFullScreen = true;
                // let activatedTab = this.tabs.filter(tab => tab.activated)[0];
                // logToGoogle("Multi Peptide", "Full Screen", activatedTab.label);
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

        saveAsImage() {
            // TODO needs to be reimplemented
            // let activeTab = "";
            // for (let tab of this.tabs) {
            //     if (tab.activated) {
            //         activeTab = tab.label;
            //     }
            // }

            // let activatedTab = this.tabs.filter(tab => tab.activated)[0];
            // logToGoogle("Multi Peptide", "Save Image", activatedTab.label);
            // if (activeTab === "Sunburst") {
            //     d3.selectAll(".toHide").attr("class", "arc hidden");
            //     triggerDownloadModal("#sunburstWrapper svg", null, "unipept_sunburst");
            //     d3.selectAll(".hidden").attr("class", "arc toHide");
            // } else if (activeTab === "Treemap") {
            //     triggerDownloadModal(null, "#treemap", "unipept_treemap");
            // } else {
            //     triggerDownloadModal("#treeviewWrapper svg", null, "unipept_treeview");
            // }
        }

        
    }
</script>

<style scoped>
    .fullscreen-nav {
        position: absolute;
        z-index: 1;
        right: 16px;
        top: 16px;
    }
</style>

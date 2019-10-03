<template>
    <fullscreen ref="fullScreenContainer" @change="fullScreenChange">
        <v-card style="overflow: hidden; min-height: 100%;" :class="{'full-screen': isFullScreen, 'full-screen-container': true}">
            <v-tabs :color="isFullScreen ? 'accent' : 'primary'" :slider-color="isFullScreen ? 'white' : 'accent'" dark :fixed-tabs="isFullScreen" v-model="tab">
                <div v-if="isFullScreen" class="unipept-logo">
                    <img src="/images/trans_logo.png" alt="logo" width="40" height="40">
                </div>
                <v-tab>
                    Sunburst
                </v-tab>
                <v-tab>
                    Treemap
                </v-tab>
                <v-tab>
                    Treeview
                </v-tab>
                <v-tab v-if="!isFullScreen">
                    Hierarchical Outline
                </v-tab>
                <v-tab v-if="!isFullScreen" @click="openHeatmapWizard()" v-on:click.stop>
                    Heatmap
                </v-tab>
                <v-spacer>
                </v-spacer>
                <v-menu v-if="!isFullScreen && this.tab < 3" bottom left :disabled="!this.$store.getters.activeDataset || $store.getters.activeDataset.progress !== 1">
                    <template v-slot:activator="{ on }">
                        <v-btn text class="align-self-center mr-4" v-on="on">
                            More
                            <v-icon right>arrow_drop_down</v-icon>
                        </v-btn>
                    </template>

                    <v-list class="grey lighten-3">
                        <v-list-tile key="enter-full-screen" @click="switchToFullScreen()" >
                            <v-list-tile-title>
                                <v-icon>
                                    mdi-fullscreen
                                </v-icon>
                                Enter full screen
                            </v-list-tile-title>
                        </v-list-tile>
                        <v-list-tile key="save-as-image" @click="saveAsImage()" >
                            <v-list-tile-title>
                                <v-icon>
                                    mdi-download
                                </v-icon>
                                Save as image
                            </v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>
                <div v-if="isFullScreen">
                    <v-btn icon text @click="reset()">
                        <v-icon color="white">
                            mdi-restore
                        </v-icon>
                    </v-btn>
                    <v-btn icon text @click="saveAsImage()">
                        <v-icon color="white">
                            mdi-download
                        </v-icon>
                    </v-btn>
                    <v-btn icon text @click="exitFullScreen()">
                        <v-icon color="white">
                            mdi-fullscreen-exit
                        </v-icon>
                    </v-btn>
                </div>
            </v-tabs>
            <v-tabs-items v-model="tab">
                <v-tab-item>
                    <v-card flat>
                        <sunburst-visualization ref="sunburst" :full-screen="isFullScreen" class="unipept-sunburst" v-if="$store.getters.activeDataset && $store.getters.activeDataset.progress === 1" :dataset="$store.getters.activeDataset"></sunburst-visualization>
                        <div v-else class="mpa-waiting">
                            <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_sunburst.svg">
                        </div>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card flat>
                        <treemap-visualization ref="treemap" id="treemap" :full-screen="isFullScreen" v-if="$store.getters.activeDataset && $store.getters.activeDataset.progress === 1" :dataset="$store.getters.activeDataset"></treemap-visualization>
                        <div v-else class="mpa-waiting">
                            <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_treemap.svg">
                        </div>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card flat>
                        <treeview-visualization ref="treeview" :full-screen="isFullScreen" v-if="$store.getters.activeDataset && $store.getters.activeDataset.progress === 1" :dataset="$store.getters.activeDataset"></treeview-visualization>
                        <div v-else class="mpa-waiting">
                            <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_treeview.svg">
                        </div>
                    </v-card>
                </v-tab-item>
                <v-tab-item>
                    <v-card flat>
                        <v-card-text>
                            <hierarchical-outline-visualization v-if="$store.getters.activeDataset" :dataset="$store.getters.activeDataset"></hierarchical-outline-visualization>
                            <div v-else>
                                {{ waitString }}
                            </div>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
            </v-tabs-items>
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
        </v-card>
    </fullscreen>
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
    import Assay from "../../assay/Assay";
    import HeatmapWizardSingleSample from "./../heatmap/heatmap-wizard-single-sample.vue";
    import DatasetVisualizations from "./dataset-visualizations.vue";
    import fullscreen from 'vue-fullscreen';

    @Component({
        components: {
            HeatmapVisualization,
            CardHeader,
            HierarchicalOutlineVisualization,
            TreeviewVisualization,
            TreemapVisualization,
            SunburstVisualization,
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
        $refs!: {
            fullScreenContainer: fullscreen,
            sunburst: SunburstVisualization,
            treeview: TreeviewVisualization,
            treemap: TreemapVisualization,
            heatmap: HeatmapVisualization
        }

        private waitString = "Please wait while we are preparing your data...";
        private isFullScreen: boolean = false;
        private dialogOpen: boolean = false;

        private tab = null;

        private readonly tabs: string[] = ["Sunburst", "Treemap", "Treeview", "Hierarchical outline", "Heatmap"];

        mounted() {
            $(document).bind(window.fullScreenApi.fullScreenEventName, () => this.exitFullScreen());
            $(".fullScreenActions a").tooltip({placement: "bottom", delay: {"show": 300, "hide": 300}});
        }

        @Watch('datasetsChosen') 
        private onDatasetsChosenChanged(newValue: boolean, oldValue: boolean) {
            if (newValue) {
                this.waitString = "Please wait while we are preparing your data...";
            } else {
                this.waitString = "Please select at least one dataset to continue the analysis...";
            }
        }
        
        private switchToFullScreen() {
            if (window.fullScreenApi.supportsFullScreen) {
                this.isFullScreen = true;
                this.$refs.fullScreenContainer.toggle();
                logToGoogle("Multi Peptide", "Full Screen", this.tabs[this.tab]);
                $(".tip").appendTo(".full-screen-container");
            }
        }

        private exitFullScreen() {
            this.isFullScreen = false;
            this.$refs.fullScreenContainer.toggle();
            $(".tip").appendTo("body");
        }

        private fullScreenChange(state: boolean) {
            this.isFullScreen = state;
        }

        private reset() {
            (this.$refs.sunburst as SunburstVisualization).reset();
            (this.$refs.treeview as TreeviewVisualization).reset();
            (this.$refs.treemap as TreemapVisualization).reset();
            (this.$refs.heatmap as HeatmapVisualization).reset();
        }

        private saveAsImage() {
            logToGoogle("Multi Peptide", "Save Image", this.tabs[this.tab]);
            if (this.tabs[this.tab] === "Sunburst") {
                d3.selectAll(".toHide").attr("class", "arc hidden");
                triggerDownloadModal("#sunburstWrapper svg", null, "unipept_sunburst");
                d3.selectAll(".hidden").attr("class", "arc toHide");
            } else if (this.tabs[this.tab] === "Treemap") {
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
    /* .fullscreen-nav {
        position: absolute;
        z-index: 1;
        right: 16px;
        top: 16px;
    }

    .unipept-logo {
        z-index: 100;
        position: absolute;
        top: 10px;
        left: 10px;
    }

    .fullScreenButtons {
        position: absolute;
        z-index: 10;
        right: 16px;
        top: 5px;
    } */
</style>

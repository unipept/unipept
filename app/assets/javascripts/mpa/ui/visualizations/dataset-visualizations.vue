<template>
    <div>
        <v-tabs :color="tabColor" :dark="dark" :fixed-tabs="fixedTabs" :slider-color="sliderColor">
            <v-tab>
                Sunburst
            </v-tab>
            <v-tab-item>
                <v-card flat>
                    <sunburst-visualization ref="sunburst" :full-screen="fullScreen" class="unipept-sunburst" v-if="$store.getters.activeDataset && $store.getters.activeDataset.progress === 1" :dataset="$store.getters.activeDataset"></sunburst-visualization>
                    <div v-else class="mpa-waiting">
                        <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_sunburst.svg">
                    </div>
                </v-card>
            </v-tab-item>
            <v-tab>
                Treemap
            </v-tab>
                <v-tab-item>
                <v-card flat>
                    <treemap-visualization ref="treemap" id="treemap" :full-screen="fullScreen" v-if="$store.getters.activeDataset && $store.getters.activeDataset.progress === 1" :dataset="$store.getters.activeDataset"></treemap-visualization>
                    <div v-else class="mpa-waiting">
                        <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_treemap.svg">
                    </div>
                </v-card>
            </v-tab-item>
            <v-tab>
                Treeview
            </v-tab>
                <v-tab-item>
                <v-card flat>
                    <treeview-visualization ref="treeview" :full-screen="fullScreen" v-if="$store.getters.activeDataset && $store.getters.activeDataset.progress === 1" :dataset="$store.getters.activeDataset"></treeview-visualization>
                    <div v-else class="mpa-waiting">
                        <img :alt="waitString" class="mpa-placeholder" src="/images/mpa/placeholder_treeview.svg">
                    </div>
                </v-card>
            </v-tab-item>
            <v-tab>
                Hierarchical Outline
            </v-tab>
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
            <v-tab v-if="heatmap" @click="openHeatmapWizard()" v-on:click.stop>
                Heatmap
            </v-tab>
        </v-tabs>
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
    </div>
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
    export default class DatasetVisualizations extends Vue {
        @Prop()
        private fullScreen: boolean;
        @Prop({default: "primary"})
        private tabColor: string;
        @Prop({default: true})
        private dark: boolean;
        @Prop({default: false})
        private fixedTabs: boolean;
        // Is it allowed for users to open the heatmap wizard?
        @Prop({default: true})
        private heatmap: boolean;

        private sliderColor: string = "accent";
        private dialogOpen: boolean = false;
        private waitString = "Please wait while we are preparing your data...";

        mounted() {
            if (this.tabColor === "accent") {
                this.sliderColor = "white";
            }
        }

        @Watch('datasetsChosen') onDatasetsChosenChanged(newValue: boolean) {
            if (newValue) {
                this.waitString = "Please wait while we are preparing your data...";
            } else {
                this.waitString = "Please select at least one dataset to continue the analysis...";
            }
        }

        private reset() {
            (this.$refs.sunburst as SunburstVisualization).reset();
            (this.$refs.treeview as TreeviewVisualization).reset();
            (this.$refs.treemap as TreemapVisualization).reset();
            (this.$refs.heatmap as HeatmapVisualization).reset();
        }

        private openHeatmapWizard(): void {
            this.dialogOpen = true;
        }
    }
</script>

<style scoped>
</style>

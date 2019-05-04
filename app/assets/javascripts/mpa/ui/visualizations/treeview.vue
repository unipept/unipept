<template>
    <div v-once ref="visualization"></div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component, {mixins} from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Node from "./../../Node";

    @Component
    export default class Treeview extends Vue {
        @Prop({required: true})
        private data: Node;
        @Prop({required: true})
        private width: number;
        @Prop({required: true})
        private height: number;
        @Prop()
        private tooltip: (d: any) => string; 
        @Prop({default: false})
        private enableAutoExpand: number | boolean;
        @Prop()
        private colors: (d: any) => string;
        @Prop()
        private rerootCallback: (d: any) => void;
        @Prop()
        private linkStrokeColor: (d: any) => string;
        @Prop()
        private nodeStrokeColor: (d: any) => string
        @Prop()
        private nodeFillColor: (d: any) => string;

        private settingNames: [string, string][] = [
            ["getTooltip", "tooltip"],
            ["colors", "colors"],
            ["rerootCallback", "rerootCallback"],
            ["linkStrokeColor", "linkStrokeColor"],
            ["nodeStrokeColor", "nodeStrokeColor"],
            ["nodeFillColor", "nodeFillColor"]
        ];

        private treeview!: any;

        mounted() {
            this.initVisualization();
        }

        public setFullScreen(value: boolean): void {
            if (this.treeview) {
                this.treeview.setFullScreen(value);
            }
        }

        public reset(): void {
            if (this.treeview) {
                this.treeview.reset();
            }
        }

        @Watch("data")
        @Watch("width")
        @Watch("height")
        @Watch("tooltip")
        @Watch("enableAutoExpand")
        @Watch("colors")
        @Watch("rerootCallback")
        @Watch("nodeFillColor")
        @Watch("linkStrokeColor")
        @Watch("nodeStrokeColor")
        private async initVisualization() {
            if (this.data) {
                let settings = {
                    width: this.width,
                    height: this.height,
                    enableAutoExpand: this.enableAutoExpand,
                }

                // Only these settings that are explicitly filled in should to be passed as an option
                for (let [settingsName, funcName] of this.settingNames) {
                    if (this[funcName]) {
                        settings[settingsName] = this[funcName];
                    }
                }

                this.treeview = $(this.$refs.visualization).html("").treeview(JSON.parse(JSON.stringify(this.data)), settings);
            }
        }
    }
</script>

<style scoped>
</style>

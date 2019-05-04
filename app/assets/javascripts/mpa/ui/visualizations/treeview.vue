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
        @Prop()
        private enableAutoExpand: boolean;
        @Prop()
        private colors: (d: any) => string;
        @Prop()
        private rerootCallback: (d: any) => void;

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
        private async initVisualization() {
            if (this.data) {
                this.treeview = $(this.$refs.visualization).html("").treeview(JSON.parse(JSON.stringify(this.data)), {
                    width: this.width,
                    height: this.height,
                    getTooltip: this.tooltip,
                    // The boolean value here needs to be copied, as it is mutated by the treeview
                    enableAutoExpand: this.enableAutoExpand ? true : false,
                    colors: this.colors,
                    rerootCallback: this.rerootCallback
                });
            }
        }
    }
</script>

<style scoped>
</style>

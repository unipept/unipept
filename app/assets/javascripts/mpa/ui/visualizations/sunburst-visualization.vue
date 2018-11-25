<template>
    <div></div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {Tree} from "../../tree";
    import NewPeptideContainer from "../../NewPeptideContainer";
    import {tooltipContent} from "./VisualizationHelper";

    @Component
    export default class SunburstVisualization extends Vue {
        @Prop({default: null}) dataset: NewPeptideContainer | null;

        mounted() {
            this.initTree();
        }

        @Watch('dataset') onDatasetChanged() {
            this.initTree();
        }

        private initTree() {
            if (this.dataset != null && this.dataset.getDataset() != null) {
                let tree: Tree = this.dataset.getDataset().getTree();
                const data = JSON.stringify(tree.getRoot());

                $(this.$el).sunburst(JSON.parse(data), {
                    width: 740,
                    height: 740,
                    radius: 740 / 2,
                    getTooltip: tooltipContent,
                    getTitleText: d => `${d.name} (${d.rank})`
                })
            }
        }
    }
</script>

<style scoped>

</style>

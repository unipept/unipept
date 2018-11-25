<template>
    <div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import {Tree} from "../../tree";
    import NewPeptideContainer from "../../NewPeptideContainer";

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
            setTimeout(() => {
                if (this.dataset != null && this.dataset.getDataset() != null) {
                    let tree: Tree = this.dataset.getDataset().getTree();
                    console.log(tree);
                    const data = JSON.stringify(tree.getRoot());
                    console.log(data);

                    $(this.$el).sunburst(JSON.parse(data), {
                        width: 740,
                        height: 740,
                        radius: 740 / 2,
                        getTooltip: this.tooltipContent,
                        getTitleText: d => `${d.name} (${d.rank})`
                    })
                }
            }, 1000);
        }

        private tooltipContent(d): string {
            return "<b>" + d.name + "</b> (" + d.rank + ")<br/>" +
                (!d.data.self_count ? "0" : d.data.self_count) +
                (d.data.self_count && d.data.self_count === 1 ? " sequence" : " sequences") + " specific to this level<br/>" +
                (!d.data.count ? "0" : d.data.count) +
                (d.data.count && d.data.count === 1 ? " sequence" : " sequences") + " specific to this level or lower";
        }
    }
</script>

<style scoped>

</style>

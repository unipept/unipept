<template>
    <card-nav>
        <tab label="Sunburst" :active="true">
            <sunburst-visualization :dataset="$store.getters.activeDataset"></sunburst-visualization>
        </tab>
        <tab label="Treemap">
            <treemap-visualization :dataset="$store.getters.activeDataset"></treemap-visualization>
        </tab>
        <tab label="Treeview">
        </tab>
        <tab label="Hierarchical outline">
        </tab>
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

    @Component({
        components: {TreemapVisualization, SunburstVisualization, CardNav, Tab}
    })
    export default class SingleDatasetVisualizationsCard extends Vue {

    }
</script>

<style scoped>

</style>

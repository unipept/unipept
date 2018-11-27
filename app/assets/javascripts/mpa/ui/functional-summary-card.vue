<template>
    <card-nav>
        <tab label="GO terms" :active="true">
            <div v-if="!$store.getters.activeDataset" class="mpa-unavailable go">
                <h3>Biological Process</h3>
                <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we ware preparing your data..." class="mpa-placeholder">
                <h3>Cellular Component</h3>
                <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we ware preparing your data..." class="mpa-placeholder">
                <h3>Molecular Function</h3>
                <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we ware preparing your data..." class="mpa-placeholder">
            </div>
            <div v-else v-for="variant in namespaces">
                <go-terms-summary :namespace="variant" :peptide-container="$store.getters.activeDataset"></go-terms-summary>
            </div>
        </tab>
        <tab label="EC numbers">
        </tab>
    </card-nav>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import CardNav from "../../components/card/card-nav.vue";
    import Tab from "../../components/card/tab.vue";
    import GoTermsSummary from "./tables/go-terms-summary.vue";
    import MpaAnalysisManager from "../MpaAnalysisManager";

    @Component({
        components: {GoTermsSummary, Tab, CardNav}
    })
    export default class FunctionalSummaryCard extends Vue {
        namespaces: string[] = MpaAnalysisManager.GO_NAMESPACES;
    }
</script>

<style scoped>

</style>

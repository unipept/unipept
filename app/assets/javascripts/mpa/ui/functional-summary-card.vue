<template>
    <card-nav>
        <tab label="GO terms" :active="true">
            This panel shows the Gene Ontology annotations that were matched to
            your peptides. <span v-if="fa" v-html="this.trustLine(fa, 'GO term')"></span>Click on a row in a table to see a taxonomy tree that highlights occurrences.
            <div v-if="!$store.getters.activeDataset" class="mpa-unavailable go">
                <h3>Biological Process</h3>
                <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we ware preparing your data..." class="mpa-placeholder">
                <h3>Cellular Component</h3>
                <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we ware preparing your data..." class="mpa-placeholder">
                <h3>Molecular Function</h3>
                <img src="/images/mpa/placeholder_GO.svg" alt="Please wait while we ware preparing your data..." class="mpa-placeholder">
            </div>
            <div v-else v-for="variant in namespaces">
                <go-terms-summary :percent-settings="percentSettings" :sort-settings="faSortSettings" :fa="fa" :namespace="variant" :peptide-container="$store.getters.activeDataset"></go-terms-summary>
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
    import FaSortSettings from "./tables/FaSortSettings";
    import {numberToPercent} from "../../utils";
    import FaPercentSettings from "./tables/FaPercentSettings";
    import {Dataset} from "../dataset";
    import NewPeptideContainer from "../NewPeptideContainer";
    import {FunctionalAnnotations} from "../../fa/FunctionalAnnotations";

    @Component({
        components: {GoTermsSummary, Tab, CardNav},
        computed: {
            watchableDataset: {
                get(): NewPeptideContainer {
                    return this.$store.getters.activeDataset
                }
            }
        }
    })
    export default class FunctionalSummaryCard extends Vue {
        namespaces: string[] = MpaAnalysisManager.GO_NAMESPACES;

        private formatType: string = "int";
        private fieldType: string = "numberOfPepts";
        private shadeFieldType: string = "fractionOfPepts";
        private name: string = "Peptides";

        private readonly formatters = {
            "int": x => x.toString(),
            "percent": x => numberToPercent(x),
            "2pos": x => x.toFixed(2).toString(),
        };

        faSortSettings: FaSortSettings = new FaSortSettings(
            (x: string) => this.formatters[this.formatType](x[this.fieldType]),
            (x: string) => this.formatters[this.formatType](x),
            this.fieldType,
            this.shadeFieldType,
            this.name,
            (a, b) => b[this.fieldType] - a[this.fieldType]
        );

        percentSettings: FaPercentSettings = new FaPercentSettings(5);

        fa: FunctionalAnnotations | null = null;

        @Watch('watchableDataset') onWatchableDatasetChanged() {
            this.onPeptideContainerChanged();
        }

        private async onPeptideContainerChanged() {
            await this.redoFAcalculations();
            this.fa = this.$store.getters.activeDataset.getDataset().fa;
        }

        private async redoFAcalculations(name = "Organism", id = -1, timeout = 500): Promise<void> {
            let peptideContainer = this.$store.getters.activeDataset;

            if (peptideContainer && peptideContainer.getDataset()) {
                let dataset: Dataset = peptideContainer.getDataset();

                const percent = this.percentSettings.percentFa;
                let sequences = null;

                if (id > 0) {
                    const taxonData = dataset.getTree().nodes.get(id);
                    sequences = dataset.getTree().getAllSequences(id);
                    $(".mpa-fa-scope").text(`${taxonData.name} (${taxonData.rank})`);
                    $(".mpa-fa-numpepts").text("");
                    $("#fa-filter-warning").show();
                } else {
                    $("#fa-filter-warning").hide();
                }

                await dataset.reprocessFA(percent, sequences);
                if (dataset.baseFa === null) {
                    dataset.setBaseFA();
                }
            }
        }

        /**
         * Creates a line indicating the trust of the function annotations
         * @param {FunctionalAnnotations} fa
         * @param {String} kind Human readable word that fits in "To have at least one … assigned to it"
         * @return {string}
         */
        private trustLine(fa, kind) {
            const trust = fa.getTrust();
            if (trust.annotatedCount === 0) {
                return `<strong>No peptide</strong> has a ${kind} assigned to it.`;
            }
            if (trust.annotatedCount === trust.totalCount) {
                return `<strong>All peptides</strong> ${trust.annotatedCount <= 5 ? `(only ${trust.annotatedCount})` : ""} have at least one ${kind} assigned to them.`;
            }
            if (trust.annotatedCount === 1) {
                return `Only <strong>one peptide</strong> (${numberToPercent(trust.annotaionAmount)}) has at least one ${kind} assigned to it.`;
            }
            return `<strong>${trust.annotatedCount} peptides</strong> (${numberToPercent(trust.annotaionAmount)}) have at least one ${kind} assigned to them.`;
        }
    }
</script>

<style scoped>

</style>

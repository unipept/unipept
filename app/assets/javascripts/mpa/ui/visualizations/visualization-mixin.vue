<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import NewPeptideContainer from "../../NewPeptideContainer";

    @Component
    export default class VisualizationMixin extends Vue {
        @Prop({default: null}) dataset: NewPeptideContainer | null;

        /**
         * Propagate selections in the visualisation to the search tree and
         * The functional analysis data.
         *
         * @param id Taxon id to inspect
         * @param searchTerm Search term to put in box
         * @param [timeout=500] timeout in ms to wait before processing
         */
        public search(id: number, searchTerm, timeout = 500) {
            setTimeout(() => {
                this.$store.dispatch('setSelectedTerm', searchTerm);
                this.$store.dispatch('setSelectedTaxonId', id);
            }, timeout);
        }

        get watchableTaxonId() {
            return this.$store.getters.selectedTaxonId;
        }
    }
</script>

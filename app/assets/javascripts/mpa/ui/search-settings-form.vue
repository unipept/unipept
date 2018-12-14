<template>
    <div>
        <label>Search settings</label>
        <checkbox :disabled="disabled" v-model="equateIlModel" label="Equate I and L" placeholder="Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries."></checkbox>
        <checkbox :disabled="disabled" v-model="filterDuplicatesModel" label="Filter duplicate peptides" placeholder="Remove duplicate peptides from the input before searching."></checkbox>
        <checkbox :disabled="disabled" v-model="missingCleavageModel" label="Advanced missing cleavage handling" placeholder="Recombine subpeptides of miscleavages. Enabling this has a serious performance impact!"></checkbox>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Checkbox from "../../components/input/checkbox.vue";
    import SearchSettings from "../SearchSettings";

    @Component({
        components: {Checkbox},
        computed: {
            equateIlModel: {
                get() {
                    return this.equateIl;
                },
                set(val) {
                    this.equateIlData = val;
                    this.$emit('equate-il-change', val);
                }
            },
            filterDuplicatesModel: {
                get() {
                    return this.filterDuplicates;
                },
                set(val) {
                    this.filterDuplicatesData = val;
                    this.$emit('filter-duplicates-change', val);
                }
            },
            missingCleavageModel: {
                get() {
                    return this.missingCleavage;
                },
                set(val) {
                    this.missingCleavageData = val;
                    this.$emit('missing-cleavage-change', val);
                }
            }
        }
    })
    export default class SearchSetingsForm extends Vue {
        @Prop({default: false}) disabled: boolean;
        @Prop({default: true}) equateIl: boolean;
        @Prop({default: true}) filterDuplicates: boolean;
        @Prop({default: false}) missingCleavage: boolean;

        equateIlData: boolean = this.equateIl;
        filterDuplicatesData: boolean = this.filterDuplicates;
        missingCleavageData: boolean = this.missingCleavage;

        @Watch('equateIl') onEquateIlChanged() {
            this.equateIlData = this.equateIl;
        }

        @Watch('filterDuplicates') onFilterDuplicatesChanged() {
            this.filterDuplicatesData = this.filterDuplicates;
        }

        @Watch('missingCleavage') onMissingCleavageChanged() {
            this.missingCleavageData = this.missingCleavage;
        }
    }
</script>

<style scoped>

</style>

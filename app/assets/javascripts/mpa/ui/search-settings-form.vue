<template>
    <div>
        <label>Search settings</label>
        <checkbox v-model="equateIlModel" label="Equate I and L" placeholder="Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries."></checkbox>
        <checkbox v-model="filterDuplicatesModel" label="Filter duplicate peptides" placeholder="Remove duplicate peptides from the input before searching."></checkbox>
        <checkbox v-model="missingCleavageModel" label="Advanced missing cleavage handling" placeholder="Recombine subpeptides of miscleavages. Enabling this has a serious performance impact!"></checkbox>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";
    import Checkbox from "../../components/input/checkbox.vue";

    @Component({
        components: {Checkbox},
        computed: {
            equateIlModel: {
                get() {
                    return this.equateIl;
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            filterDuplicatesModel: {
                get() {
                    return this.filterDuplicates;
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            missingCleavageModel: {
                get() {
                    return this.missingCleavage;
                },
                set(val) {
                    this.$emit('input', val);
                }
            }
        }
    })
    export default class SearchSettingsForm extends Vue {
        @Prop({default: true}) equateIl: boolean;
        @Prop({default: true}) filterDuplicates: boolean;
        @Prop({default: true}) missingCleavage: boolean;

        equateIlData: boolean = this.equateIl;
        filterDuplicatesData: boolean = this.filterDuplicates;
        missingCleavageData: boolean = this.missingCleavage;

        @Watch('equateIl') onEquateIlChanged(newEquateIl: boolean, oldEquateIl: boolean) {
            this.equateIlData = newEquateIl;
        }

        @Watch('filterDuplicates') onFilterDuplicatesChanged(newFilterDuplicates: boolean, oldFilterDuplicates: boolean) {
            this.filterDuplicatesData = newFilterDuplicates;
        }

        @Watch('missingCleavage') onMissingCleavageChanged(newMissingCleavage: boolean, oldMissingCleavage: boolean) {
            this.missingCleavageData = newMissingCleavage;
        }
    }
</script>

<style scoped>

</style>

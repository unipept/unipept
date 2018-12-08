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
                    return this.$store.getters.searchSettings.isEquateIl();
                },
                set(val) {
                    this.$store.dispatch('setSearchSettings', new SearchSettings(val, this.filterDuplicatesModel, this.missingCleavageModel));
                }
            },
            filterDuplicatesModel: {
                get() {
                    return this.$store.getters.searchSettings.isFilterDuplicates();
                },
                set(val) {
                    this.$store.dispatch('setSearchSettings', new SearchSettings(this.equateIlModel, val, this.missingCleavageModel));
                }
            },
            missingCleavageModel: {
                get() {
                    return this.$store.getters.searchSettings.isHandleMissingCleavage();
                },
                set(val) {
                    this.$store.dispatch('setSearchSettings', new SearchSettings(this.equateIlModel, this.filterDuplicatesModel, val));
                }
            }
        }
    })
    export default class SearchSetingsForm extends Vue {
        @Prop({default: false}) disabled: boolean;
    }
</script>

<style scoped>

</style>

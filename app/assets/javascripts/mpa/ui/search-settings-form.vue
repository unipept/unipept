<template>
    <div>
        <label>Search settings</label>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <div v-on="on">
                    <v-checkbox :disabled="disabled" v-model="equateIlModel" label="Equate I and L" hide-details></v-checkbox>
                </div>
            </template>
            <span>Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries.</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-checkbox v-on="on" :disabled="disabled" v-model="filterDuplicatesModel" label="Filter duplicate peptides" hide-details></v-checkbox>
            </template>
            <span>Remove duplicate peptides from the input before searching.</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <div v-on="on">
                    <v-checkbox :disabled="disabled" v-model="missingCleavageModel" label="Advanced missing cleavage handling" hide-details></v-checkbox>
                </div>
            </template>
            <span>Recombine subpeptides of miscleavages. Enabling this has a serious performance impact!</span>
        </v-tooltip>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component({
        components: {},
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

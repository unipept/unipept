<template>
    <div>
        <v-textarea name="qs" label="Peptide list" :rows="7" v-model="peptideModel" :disabled="loading" :rules="[value => !!value || 'At least one peptide is required']"></v-textarea>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-text-field v-on="on" name="search_name" label="Name this dataset"  :disabled="loading" placeholder="e.g. Sample B5" v-model="nameModel" :rules="[value => !!value || 'Name is required when the dataset is set to be saved']" clearable></v-text-field>
            </template>
            <span>This name will be shown on the results page. Handy if you have many open tabs.</span>
        </v-tooltip>
        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <div v-on="on">
                    <v-checkbox :disabled="loading" v-model="saveModel" label="Store dataset in browser's local storage" hide-details></v-checkbox>
                </div>
            </template>
            <span>Store dataset in local storage and reuse it later on.</span>
        </v-tooltip>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component"

    import ValidatedTextarea from "../../components/input/validated-textarea.vue";
    import ValidatedTextfield from "../../components/input/validated-textfield.vue"
    import {Prop, Watch} from "vue-property-decorator";
    import PeptideContainer from "../PeptideContainer";

    @Component({
        components: {ValidatedTextfield, ValidatedTextarea},
        computed: {
            peptideModel: {
                get() {
                    return this.peptides;
                },
                set(val) {
                    this.peptidesData = val;
                    this.$emit('peptide-change', val);
                }
            },
            nameModel: {
                get() {
                    return this.name;
                },
                set(val) {
                    this.nameData = val;
                    this.$emit('name-change', val);
                }
            },
            saveModel: {
                get() {
                    return this.save;
                },
                set(val) {
                    this.saveData = val;
                    console.log("EMITTING " + val);
                    this.$emit('save-change', val);
                }
            }
        }
    })
    export default class DatasetForm extends Vue {
        @Prop({default: "" }) peptides;
        @Prop({default: ""}) name;
        @Prop({default: true}) save;
        @Prop({default: false}) loading;

        peptidesData: string = this.peptides;
        nameData: string = this.name;
        saveData: boolean = this.save;

        @Watch('peptides') onPeptidesChange(newPeptides: string, oldPeptides: string) {
            this.peptidesData = newPeptides;
        }

        @Watch('name') onNameChange(newName: string, oldName: string) {
            this.nameData = newName;
        }

        @Watch('save') onSaveChanged(newSave: boolean, oldSave: boolean) {
            this.saveData = newSave;
        }

        validate(content) {
            return content !== '';
        }
    };
</script>

<style scoped>

</style>

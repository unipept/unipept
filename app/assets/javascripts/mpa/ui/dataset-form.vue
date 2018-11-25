<template>
    <div>
        <validated-textarea :disabled="loading" v-model="peptideModel" name="qs" label="Peptide list" :rows="7" :spellcheck="false" :validation="validate" validation-error="At least one peptide is required"></validated-textarea>
        <validated-textfield :disabled="loading" v-model="nameModel" name="search_name" label="Name this dataset" :validation="validate" validation-error="Name is required when the dataset is set to be saved." placeholder="e.g. Sample B5" tooltip="This name will be shown on the results page. Handy if you have many open tabs."></validated-textfield>
        <checkbox :disabled="loading" v-model="saveData" name="save_dataset" label="Store dataset in browser's local storage" tooltip="Store dataset in local storage and reuse it later on"></checkbox>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component"

    import ValidatedTextarea from "../../components/input/validated-textarea";
    import ValidatedTextfield from "../../components/input/validated-textfield"
    import Checkbox from "../../components/input/checkbox";
    import {Prop, Watch} from "vue-property-decorator";
    import NewPeptideContainer from "../NewPeptideContainer";

    @Component({
        components: {Checkbox, ValidatedTextfield, ValidatedTextarea},
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

<template>
    <div>
        <validated-textarea v-model="peptidesData" name="qs" label="Peptide list" :rows="7" :spellcheck="false" :validation="validate" validation-error="At least one peptide is required"></validated-textarea>
        <validated-textfield v-model="nameData" name="search_name" label="Name this dataset" :validation="validate" validation-error="Name is required when the dataset is set to be saved." placeholder="e.g. Sample B5" tooltip="This name will be shown on the results page. Handy if you have many open tabs."></validated-textfield>
        <checkbox v-model="saveData" name="save_dataset" label="Store dataset in browser's local storage" tooltip="Store dataset in local storage and reuse it later on"></checkbox>
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
        components: {Checkbox, ValidatedTextfield, ValidatedTextarea}
    })
    export default class DatasetForm extends Vue {
        @Prop({default: "" }) peptides;
        @Prop({default: ""}) name;
        @Prop({default: true}) save;

        peptidesData: string = this.peptides;
        nameData: string = this.name;
        saveData: boolean = this.save;

        @Watch('peptidesData') onPeptideContainerDataChange(oldPeptides: string, newPeptides: string) {
            this.$emit('input', newPeptides);
        }

        validate(content) {
            return content !== '';
        }
    };
</script>

<style scoped>

</style>

<template>
    <div>
        <validated-textarea name="qs" label="Peptide list" :rows="7" :spellcheck="false" :validation="validate" validation-error="At least one peptide is required"></validated-textarea>
        <validated-textfield name="search_name" label="Name this dataset" :validation="validate" validation-error="Name is required when the dataset is set to be saved." placeholder="e.g. Sample B5" tooltip="This name will be shown on the results page. Handy if you have many open tabs."></validated-textfield>
        <checkbox name="save_dataset" label="Store dataset in browser's local storage" tooltip="Store dataset in local storage and reuse it later on"></checkbox>
    </div>
</template>

<script>
    import ValidatedTextarea from "../components/validated-textarea";
    import ValidatedTextfield from "../components/validated-textfield"
    import Checkbox from "../components/checkbox";

    export default {
        name: "peptide-form",
        components: {Checkbox, ValidatedTextarea, ValidatedTextfield},
        methods: {
            validate: function(content) {
                return content !== '';
            }
        }
    };
</script>

<style scoped>

</style>

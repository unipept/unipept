<template>
    <div>
        <validated-textarea name="qs" label="Peptide list" :rows="7" :spellcheck="false" :validation="validate" validation-error="At least one peptide is required"></validated-textarea>
        <validated-textfield name="search_name" label="Name this dataset" :validation="validate" validation-error="Name is required when the dataset is set to be saved." placeholder="e.g. Sample B5" tooltip="This name will be shown on the results page. Handy if you have many open tabs."></validated-textfield>
        <div class="checkbox">
            <label title="" class="js-has-hover-tooltip" for="save_dataset" data-original-title="Store dataset in local storage and reuse it later on"><input type="checkbox" name="save_dataset" id="save_dataset" value="1" class="input-item" checked="checked"> Store dataset in browser's local storage</label>
        </div>
    </div>
</template>

<script>
    import ValidatedTextarea from "../components/validated-textarea";
    import ValidatedTextfield from "../components/validated-textfield"

    export default {
        name: "peptide-form",
        components: {ValidatedTextarea, ValidatedTextfield},
        methods: {
            validate: function(content) {
                return content !== '';
            }
        }
    };
</script>

<style scoped>

</style>

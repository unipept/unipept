<template>
    <div>
        <material-textarea name="qs" label="Peptide list" :rows="7" :spellcheck="false" :validation="validate" validation-error="At least one peptide is required"></material-textarea>

        <div class="form-group">
            <label for="search_name">Name this dataset</label>
            <input type="text" name="search_name" id="search_name" placeholder="e.g. Sample B5" class="form-control js-has-focus-tooltip input-item" title="" data-original-title="This name will be shown on the results page. Handy if you have many open tabs.">
        </div>
        <div class="checkbox">
            <label title="" class="js-has-hover-tooltip" for="save_dataset" data-original-title="Store dataset in local storage and reuse it later on"><input type="checkbox" name="save_dataset" id="save_dataset" value="1" class="input-item" checked="checked"> Store dataset in browser's local storage</label>
        </div>
    </div>
</template>

<script>
    import MaterialTextarea from "../components/material-textarea";
    export default {
        name: "peptide-form",
        components: {MaterialTextarea},
        methods: {
            validate: function(content) {
                return content !== '';
            }
        }
    };
</script>

<style scoped>

</style>

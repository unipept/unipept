<template>
    <div class="form-group" v-bind:class="[valid ? '' : 'has-error']">
        <label class="control-label" :for="name">{{ label }}</label>
        <textarea v-model="content" class="form-control" :name="name" :id="name" :rows="rows" :spellcheck="spellcheck" :autofocus="autofocus" @input="validate"></textarea>
        <span class="help-block" v-if="!valid">{{ validationError }}</span>
    </div>
</template>

<script>
    export default {
        name: "material-textarea",
        data: function() {
            return {
                content: '',
                valid: true
            }
        },
        props: {
            name: {
                type: String
            },
            label: {
                type: String
            },
            rows: {
                type: Number,
                default: 5
            },
            spellcheck: {
                type: Boolean,
                default: true
            },
            autofocus: {
                type: Boolean,
                default: false
            },
            validation: {
                type: Function(),
                default: function(value) {
                    return true;
                }
            },
            validationError: {
                type: String,
                default: ""
            }
        },
        methods: {
            validate: function() {
                console.log("VALIDATING...");
                this.valid = this.validation(this.content);
            }
        }
    };
</script>

<style scoped>

</style>

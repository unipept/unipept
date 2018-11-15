<template>
    <div class="form-group" v-bind:class="[valid ? '' : 'has-error']">
        <label class="control-label" :for="name">{{ label }}</label>
        <input type="text" v-model="content" class="form-control js-has-focus-tooltip" :data-original-title="tooltip" :name="name" :id="name" :autofocus="autofocus" :placeholder="placeholder" @input="validate"/>
        <span class="help-block" v-if="!valid">{{ validationError }}</span>
    </div>
</template>

<script>
    export default {
        name: "validated-textfield",
        data: function() {
            return {
                content: this.value,
                valid: true
            }
        },
        props: {
            value: {
                type: String,
                default: ''
            },
            name: {
                type: String
            },
            label: {
                type: String
            },
            autofocus: {
                type: Boolean,
                default: false
            },
            placeholder: {
                type: String,
                deafult: ""
            },
            tooltip: {
                type: String,
                default: ""
            },
            validation: {
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
                this.valid = this.validation(this.content);
            }
        },
        watch: {
            content(val) {
                this.$emit('input', val);
            }
        }
    };
</script>

<style scoped>

</style>

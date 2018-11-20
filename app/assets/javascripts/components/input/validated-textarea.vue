<template>
    <div class="form-group" v-bind:class="[valid ? '' : 'has-error']">
        <label class="control-label" :for="name">{{ label }}</label>
        <textarea v-model="model" class="form-control" :name="name" :id="name" :rows="rows" :spellcheck="spellcheck" :autofocus="autofocus" :disabled="disabled" @input="validate"></textarea>
        <span class="help-block" v-if="!valid">{{ validationError }}</span>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component({
        computed: {
            model: {
                get() {
                    return this.content
                },
                set(val) {
                    this.content = val;
                    this.$emit('input', val);
                }
            }
        }
    })
    export default class ValidatedTextarea extends Vue {
        @Prop({default: ""}) value: string;
        @Prop() name: string;
        @Prop() label: string;
        @Prop({default: 5}) rows: number;
        @Prop({default: true}) spellcheck: boolean;
        @Prop({default: false}) autofocus: boolean;
        @Prop({default: function(content) {return true;}}) validation: (string) => boolean;
        @Prop({default: ""}) validationError: string;
        @Prop({default: true}) disabled: boolean;


        content: string = this.value;
        valid: boolean = true;

        validate() {
            this.valid = this.validation(this.content);
        }

        @Watch('value') onContentChanged(newValue: string, oldValue: string) {
            this.content = newValue;
            this.validate();
        }
    };
</script>

<style scoped>

</style>

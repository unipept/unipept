<template>
    <div class="form-group" v-bind:class="[valid ? '' : 'has-error']">
        <label class="control-label" :for="name">{{ label }}</label>
        <input type="text" v-model="data" class="form-control js-has-focus-tooltip" :data-original-title="tooltip" :name="name" :id="name" :autofocus="autofocus" :placeholder="placeholder" @input="validate"/>
        <span class="help-block" v-if="!valid">{{ validationError }}</span>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component({
        computed: {
            data: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            }
        }
    })
    export default class ValidatedTextfield extends Vue {
        @Prop({default: ""}) value: string;
        @Prop() name: string;
        @Prop() label: string;
        @Prop({default: ""}) placeholder: string;
        @Prop({default: ""}) tooltip: string;
        @Prop({default: false}) autofocus: boolean;
        @Prop({default: () => ((content) => true) }) validation: (string) => boolean;
        @Prop({default: ""}) validationError: string;

        content: string = this.value;
        valid: boolean = true;

        validate() {
            this.valid = this.validation(this.content);
        }

        @Watch('value') onValueChanged(newValue: string, oldValue: string) {
            this.content = newValue;
        }
    };
</script>

<style scoped>

</style>

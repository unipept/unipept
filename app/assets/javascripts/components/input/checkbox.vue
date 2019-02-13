<template>
    <div class="checkbox">
        <label title="" class="js-has-hover-tooltip" :for="name" :data-toggle="tooltip ? 'tooltip' : ''" data-placement="right" :data-original-title="tooltip">
            <input v-model="model" type="checkbox" :name="name" :id="name" :disabled="disabled"> {{ label }}
        </label>
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
                    return this.content;
                },
                set(val) {
                    this.content = val;
                    this.$emit('input', val);
                }
            }
        }
    })
    export default class Checkbox extends Vue {
        @Prop({default: false}) value: boolean;
        @Prop() name: string;
        @Prop() label: string;
        @Prop({default: false}) autofocus: boolean;
        @Prop({default: ""}) tooltip: string;
        @Prop({default: false}) disabled: boolean;

        valid: boolean = true;
        content: boolean = this.value;

        @Watch('value') onValueChanged(newValue: boolean, oldValue: boolean) {
            this.content = newValue;
        }

        mounted() {
            $('[data-toggle="tooltip"]').tooltip();
        }
    };
</script>

<style scoped>

</style>

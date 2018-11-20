<template>
    <div class="checkbox">
        <label title="" class="js-has-hover-tooltip" :for="name" :data-original-title="tooltip">
            <input v-model="content" type="checkbox" :name="name" :id="name"> {{ label }}
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
                    return this.value;
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
        @Prop({default: ""}) placeholder: string;
        @Prop({default: ""}) tooltip: string;

        valid: boolean = true;
        content: boolean = this.value;

        @Watch('value') onValueChanged(newValue: boolean, oldValue: boolean) {
            this.content = newValue;
        }
    };
</script>

<style scoped>

</style>

<template>
    <div class="form-group" v-bind:class="[valid ? '' : 'has-error']">
        <label class="control-label" :for="name">{{ label }}</label>
        <textarea v-model="content" class="form-control" :name="name" :id="name" :rows="rows" :spellcheck="spellcheck" :autofocus="autofocus" @input="validate"></textarea>
        <span class="help-block" v-if="!valid">{{ validationError }}</span>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class ValidatedTextarea extends Vue {
        @Prop({default: ""}) value: string;
        @Prop() name: string;
        @Prop() label: string;
        @Prop({default: 5}) rows: number;
        @Prop({default: true}) spellcheck: boolean;
        @Prop({default: false}) autofocus: boolean;
        @Prop({default: function(content) {return true;}}) validation: (string) => boolean;
        @Prop({default: ""}) validationError: string;


        content: string = this.value;
        valid: boolean = true;

        validate() {
            this.valid = this.validation(this.content);
        }

        @Watch('content') onContentChanged(oldContent: string, newContent: string) {
            this.$emit('input', newContent);
        }
    };
</script>

<style scoped>

</style>

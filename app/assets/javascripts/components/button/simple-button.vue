<template>
    <button class="btn" v-bind:class="'btn-' + type" @click="$emit('click')" :data-toggle="tooltip ? 'tooltip' : ''" data-placement="right" :data-original-title="tooltip" :disabled="disabled" type="button">
        <span v-if="glyphicon !== ''" class="glyphicon" v-bind:class="'glyphicon-' + glyphicon"></span>
        {{ label }}
    </button>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop} from "vue-property-decorator";

    @Component
    export default class SimpleButton extends Vue {
        @Prop() label: string;
        @Prop({default: ""}) glyphicon: string;
        @Prop({default: "default"}) type: string;
        @Prop({default: false}) disabled: boolean;
        @Prop({default: ""}) tooltip: string;

        mounted() {
            $('[data-toggle="tooltip"]').tooltip();
        }
    }
</script>

<style scoped>

</style>

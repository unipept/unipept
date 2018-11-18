<template>
    <button class="btn" v-bind:class="'btn-' + type" @click="$emit('click')">
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
    }
</script>

<style scoped>

</style>

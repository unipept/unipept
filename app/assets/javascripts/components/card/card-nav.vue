<template>
    <div class="card card-nav">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";

    import Tab from "./tab";
    import {Prop} from "vue-property-decorator";

    @Component
    export default class CardNav extends Vue {
    }
</script>

<style scoped>
</style>

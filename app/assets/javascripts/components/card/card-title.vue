<template>
    <h2 class="card-title-text">
        <slot></slot>
    </h2>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class CardTitle extends Vue {

    }
</script>

<style scoped>

</style>

<template>
    <div class="card-supporting-text">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class CardBody extends Vue {

    }
</script>

<style scoped>

</style>

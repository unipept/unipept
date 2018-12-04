<template>
    <div class="card-title card-title-colored">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class CardHeader extends Vue {

    }
</script>

<style scoped>

</style>

<template>
    <div class="card">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class Card extends Vue {
        @Prop() title: string;
        @Prop({default: false}) interactive: boolean;
    }
</script>

<style scoped>

</style>

<template>
    <div class="card">
        <div class="card-title card-title-colored">
            <h2 class="card-title-text">{{ title }}</h2>
        </div>
        <div class="card-supporting-text">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class Card extends Vue {
        @Prop() title: string;
    }
</script>

<style scoped>

</style>

<template>
    <div class="list">
        <span v-if="placeholder !== '' && !$slots.default">{{ placeholder }}</span>
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class List extends Vue {
        @Prop({default: ""}) placeholder: string;
    }
</script>

<style scoped>

</style>

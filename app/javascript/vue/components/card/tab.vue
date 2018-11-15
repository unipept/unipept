<template>
    <div class="tab-pane" v-bind:class="{active: activated}">
        <slot></slot>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop} from "vue-property-decorator";

    @Component
    export default class Tab extends Vue {
        @Prop() public label: string;
        @Prop({default: false}) private active: boolean;

        public activated: boolean = this.active;
    }
</script>

<style scoped>

</style>

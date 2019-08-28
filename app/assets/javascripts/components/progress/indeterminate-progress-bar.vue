<template>
    <div class="unipept-progress unipept-progress-indeterminate" :style="active ? 'visibility: visible;' : 'visibility: hidden;'">
        <div class="progressbar bar bar1" style="width: 0;"></div>
        <div class="bufferbar bar bar2" style="width: 100%;"></div>
        <div class="auxbar bar bar3" style="width: 0;"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class IndeterminateProgressBar extends Vue {
        @Prop({default: false}) active;

        content: boolean = this.active;

        @Watch('active') onActiveChanged() {
            this.content = this.active;
        }
    }
</script>

<style scoped>

</style>

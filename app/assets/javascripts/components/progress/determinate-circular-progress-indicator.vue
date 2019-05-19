<template>
    <svg :width="size" :height="size" class="circular-progress">
        <circle :cx="middle" :cy="middle" :r="radius" :transform="'rotate(-90 ' + middle + ' ' + middle + ')'" :style="circleStyle"></circle>
    </svg>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class DeterminateCircularProgressIndicator extends Vue {
        @Prop({default: 48}) size: number;
        @Prop({default: 0.0}) progress: number;

        middle: number = this.size / 2;
        radius: number = this.middle - 2;
        strokeDashArray: number = Math.floor(2 * this.radius * 3.14);

        circleStyle = {
            strokeDasharray: this.strokeDashArray,
            strokeDashoffset: (1 - this.progress) * this.strokeDashArray
        };

        @Watch('progress', {deep: true}) onProgressChange() {
            this.updateProgress()
        }

        private updateProgress() {
            this.circleStyle.strokeDashoffset = (1 - this.progress) * this.strokeDashArray;
        }
    };
</script>

<style scoped>
</style>

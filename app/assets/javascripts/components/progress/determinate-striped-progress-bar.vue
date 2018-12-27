<template>
    <div class="progress">
        <div class="progress-bar progress-bar-striped active" role="progressbar" ref="progressBar" :style="{width: progress * 100 + '%'}"></div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class DeterminateStripedProgressBar extends Vue {
        @Prop({default: 0}) progress: number;
    }
</script>

<style scoped>

</style>

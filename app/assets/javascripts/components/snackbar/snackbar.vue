<template>
    <div class="vue-snackbar-container">
        <div class="vue-snackbar" v-if="snackbarActive">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class Snackbar extends Vue {
        @Prop({default: 7500}) timeout: number;

        snackbarActive: boolean = false;
        timeoutHandler = null;

        show() {
            this.snackbarActive = true;

            if (this.timeout !== 0) {
                this.timeoutHandler = setTimeout(() => {
                    this.snackbarActive = false;
                }, this.timeout);
            }
        }

        destroy() {
            this.snackbarActive = false;

            if (this.timeoutHandler != null) {
                clearTimeout(this.timeoutHandler);
                this.snackbarActive = false;
            }
        }
    }
</script>

<style scoped>

</style>

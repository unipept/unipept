<template>
    <div class="modal" :class="active ? 'fade in modal-active': 'fade'" :style="active ? 'display: block;' : 'display: none;'">
        <div class="modal-dialog" :class="wide ? 'modal-lg' : 'modal-small'">
            <div class="modal-content" v-if="$slots.header">
                <div class="modal-header">
                    <slot name="header"></slot>
                </div>
                <div class="modal-body" v-if="$slots.body">
                    <slot name="body"></slot>
                </div>
                <div class="modal-footer" v-if="$slots.footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {Prop, Watch} from "vue-property-decorator";

    @Component
    export default class Modal extends Vue {
        @Prop({default: false}) active: boolean;
        @Prop({default: false}) wide: boolean;

        private body;

        created() {
            this.body = document.getElementsByTagName("body")[0];
        }

        @Watch('active') onActiveChanged(newActive: boolean, oldActive: boolean) {
            // Hack to get default bootstrap modal working. This should be fixed if a good solution comes along.
            // Note that it is considered safe to manipulate the body from outside Vue as Vue never uses these.
            if (newActive) {
                if (!this.body.classList.contains("modal-open")) {
                    this.body.className += ' modal-open';
                }
            } else {
                if (this.body.classList.contains("modal-open")) {
                    this.body.classList.remove("modal-open");
                }
            }
        }
    }
</script>

<style scoped>

</style>

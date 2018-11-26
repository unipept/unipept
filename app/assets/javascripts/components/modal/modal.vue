<template>
    <div class="modal" :class="active ? 'fade in': 'fade'" :style="active ? 'display: block;' : 'display: none;'">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <slot name="header"></slot>
                </div>
                <div class="modal-body">
                    <slot name="body"></slot>
                </div>
                <div class="modal-footer">
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
    }
</script>

<style scoped>

</style>

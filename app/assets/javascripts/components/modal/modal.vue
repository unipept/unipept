<template>
    <div class="modal" :class="active ? 'fade in': 'fade'" :style="active ? 'display: block;' : 'display: none;'">
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
    }
</script>

<style scoped>

</style>

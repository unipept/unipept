<template>
    <div class="icon" :class="size" :style="{'fill': color}">
        <svg width="100%" height="100%" viewBox="0 0 975 1004" version="1.1" xmlns="http://www.w3.org/2000/svg"
             xml:space="preserve"
             style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:square;stroke-linejoin:round;stroke-miterlimit:1.5;">
            <g transform="matrix(1,0,0,1,-1181.1,-442.978)">
                <path d="M1653.54,472.441L1653.54,944.882" style="fill:none;stroke:black;stroke-width:41.67px;" />
                <g transform="matrix(1,0,0,1,-2.27374e-13,472.441)">
                    <path d="M1653.54,472.441L1653.54,944.882" style="fill:none;stroke:black;stroke-width:41.67px;" />
                </g>
                <path d="M1653.54,944.882L2125.98,944.882" style="fill:none;stroke:none;stroke-width:41.67px;" />
                <rect x="1181.1" y="472.441" width="944.882" height="944.882" style="fill:none;" />
            </g>
        </svg>
    </div>
</template>

<script setup lang="ts">
import Size from '../Treeview.vue';

export interface Props {
    color?: string
    size?: Size
}

withDefaults(defineProps<Props>(), {
    color: 'black',
    size: 'default'
});
</script>

<style scoped lang="scss">
@import '@/styles/icons.scss';
</style>

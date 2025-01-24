<template>
    <div
        class="icon"
        :class="size"
        :style="{'fill': color}"
    >
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 1002 943"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xml:space="preserve"
            style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:square;stroke-linejoin:round;stroke-miterlimit:1.5;"
        >
            <g transform="matrix(1,0,0,1,-1153.67,-710.694)">
                <g transform="matrix(0.997849,0,0,0.997849,4.57585,239.269)">
                    <g transform="matrix(2,0,0,1,-2125.98,0)">
                        <path
                            d="M1653.54,944.882L2125.98,944.882"
                            style="fill:none;stroke:black;stroke-width:41.67px;"
                        />
                    </g>
                </g>
                <g transform="matrix(0.997849,0,0,0.997849,4.57585,239.269)">
                    <rect
                        x="1181.1"
                        y="472.441"
                        width="944.882"
                        height="944.882"
                        style="fill:none;"
                    />
                </g>
            </g>
        </svg>
    </div>
</template>

<script setup lang="ts">
import {Size} from '../Treeview.vue';

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
@use '@/styles/icons';
</style>

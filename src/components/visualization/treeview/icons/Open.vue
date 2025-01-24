<template>
    <div
        class="icon"
        :class="size"
        :style="{'fill': color}"
    >
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 945 945"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xml:space="preserve"
            style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"
        >
            <g transform="matrix(1,0,0,1,-1181.1,-472.441)">
                <rect
                    x="1181.1"
                    y="472.441"
                    width="944.882"
                    height="944.882"
                    style="fill:none;"
                />
                <path
                    d="M1653.54,755.906L1653.54,1133.86"
                    style="fill:none;stroke:black;stroke-width:41.67px;"
                />
                <path
                    d="M1464.57,944.882L1842.52,944.882"
                    style="fill:none;stroke:black;stroke-width:41.67px;"
                />
                <path
                    d="M1984.25,678.769C1984.25,643.094 1955.33,614.173 1919.66,614.173L1387.43,614.173C1351.76,614.173 1322.84,643.094 1322.84,678.769L1322.84,1211C1322.84,1246.67 1351.76,1275.59 1387.43,1275.59L1919.66,1275.59C1955.33,1275.59 1984.25,1246.67 1984.25,1211L1984.25,678.769Z"
                    style="fill:none;stroke:black;stroke-width:41.67px;"
                />
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

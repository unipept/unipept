<template>
    <div ref="container"
         @mousedown="onMouseDown"
         @mousemove="onMouseMove"
         @mouseup="onMouseUp"
         @mouseleave="onMouseUp"
         @wheel.prevent="onZoom"
         class="interactive-image-container"
    >
        <div :style="style">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed, ref, useTemplateRef, watch} from 'vue';

const props = withDefaults(defineProps<{
    scale?: number;
    translate?: { x: number; y: number };
}>(), {
    scale: 1,
    translate: () => ({ x: 0, y: 0 })
});

const emit = defineEmits<{
    'update:scale': [value: number];
    'update:translate': [value: { x: number; y: number }];
}>();

const container = useTemplateRef<HTMLDivElement>('container');

const _scale = ref(props.scale);
const _translate = ref({ ...props.translate });

const style = computed(() => ({
    transform: `scale(${_scale.value}) translate(${_translate.value.x}px, ${_translate.value.y}px)`,
    transformOrigin: '0 0'
}));

let mouseDown = false;

const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    mouseDown = true;
};

const onMouseMove = (e: MouseEvent) => {
    if (!mouseDown) return;
    e.preventDefault();
    _translate.value.x += e.movementX / _scale.value;
    _translate.value.y += e.movementY / _scale.value;
    emit('update:translate', { ..._translate.value });
};

const onMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    mouseDown = false;
};

const onZoom = (e: WheelEvent) => {
    const oldScale = _scale.value;
    const newScale = Math.min(Math.max(0.25, oldScale + e.deltaY * -0.005), 4);
    if (newScale === oldScale) return;

    // Adjust translate so the point under the cursor stays fixed
    const rect = container.value!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    _translate.value.x += mx * (1 / newScale - 1 / oldScale);
    _translate.value.y += my * (1 / newScale - 1 / oldScale);

    _scale.value = newScale;
    emit('update:scale', _scale.value);
    emit('update:translate', { ..._translate.value });
};

watch(() => props.scale, scale => (_scale.value = scale));
watch(() => props.translate, translate => (_translate.value = { ...translate }));
</script>

<style scoped>
.interactive-image-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    cursor: grab;
}

.interactive-image-container:active {
    cursor: grabbing;
}
</style>

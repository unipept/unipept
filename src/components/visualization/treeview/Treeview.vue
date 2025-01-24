<template>
    <div class="d-flex flex-column">
        <div class="d-flex">
            <div
                v-if="depth > 0"
                class="d-flex"
            >
                <div
                    v-for="(line, idx) in lines"
                    :key="idx"
                >
                    <vertical-line
                        v-if="line"
                        :size="size"
                    />
                    <empty
                        v-else
                        :size="size"
                    />
                </div>

                <corner
                    v-if="last"
                    :size="size"
                />
                <cross
                    v-if="!last"
                    :size="size"
                />
                <horizontal-line
                    v-if="selectable && !hasChildren"
                    :size="size"
                />
            </div>

            <close
                v-if="hasChildren && (isExpanded || node.match)"
                style="cursor: pointer;"
                :size="size"
                @click="isExpanded = !isExpanded"
            />
            <open
                v-else-if="hasChildren && !isExpanded"
                style="cursor: pointer;"
                :size="size"
                @click="isExpanded = !isExpanded"
            />

            <treeview-check-box
                v-if="selectable && depth > 0"
                v-model="itemSelected"
                :size="size"
                :disabled="selectedItems.length >= max"
            />

            <div
                class="text pe-1"
                :class="size"
                :style="{
                    'font-weight': node.highlighted ? 'bold' : 'normal',
                    'color': selectedItems.length >= max && !itemSelected ? '#7d7d7d' : 'black'
                }"
                @click="selectedText = node"
            >
                <span v-if="node.match">
                    <span>{{ node.name.slice(0, node.match.start) }}</span>
                    <b :style="{ 'color': '#306ccf' }">
                        {{ node.name.slice(node.match.start, node.match.end) }}
                    </b>
                    <span>{{ node.name.slice(node.match.end) }}</span>
                    <span v-if="node.nameExtra"> ({{ node.nameExtra }})</span>
                </span>
                <span v-else>
                    {{ node.name }}
                    <span v-if="node.nameExtra"> ({{ node.nameExtra }})</span>
                </span>
            </div>
        </div>

        <div v-if="isExpanded || node.match">
            <treeview
                v-for="(child, i) in node.children"
                :key="child.id"
                v-model:items="selectedItems"
                v-model:item="selectedText"
                :node="child"
                :lines="depth > 0 ? [ ...lines, !last ] : lines"
                :depth="depth + 1"
                :expanded="expanded"
                :size="size"
                :last="i === amountOfChildren - 1"
                :max="max"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Treeview from './Treeview.vue';
import Corner from './icons/Corner.vue';
import Cross from './icons/Cross.vue';
import HorizontalLine from './icons/HorizontalLine.vue';
import VerticalLine from './icons/VerticalLine.vue';
import Empty from './icons/Empty.vue';
import Close from './icons/Close.vue';
import Open from './icons/Open.vue';
import TreeviewCheckBox from './TreeviewCheckBox.vue';

const selectedItems = defineModel<TreeviewItem[]>("items", { default: [] });
const selectedText = defineModel<TreeviewItem>("item", { default: undefined });

const {
    node,
    lines = [],
    depth = 0,
    expanded = false,
    size = 'default',
    last = false,
    max = 0
} = defineProps<{
    node: TreeviewItem

    lines?: boolean[]
    depth?: number
    expanded?: boolean | number
    size?: Size
    last?: boolean
    max?: number
}>();

const isExpanded = ref<boolean>(
    Number.isInteger(expanded) ? expanded as number > depth : expanded as boolean
);
const itemSelected = ref<boolean>(selectedItems.value.some(item => item.id === node.id));

const selectable = computed(() => max > 0);
const amountOfChildren = computed(() => node.children.length);
const hasChildren = computed(() => amountOfChildren.value > 0);

watch(() => expanded, (newValue) => {
    isExpanded.value = Number.isInteger(newValue) ? newValue as number > depth : newValue as boolean;
});
</script>

<script lang="ts">
export interface TreeviewItem {
    id: number
    name: string
    nameExtra: string
    highlighted: boolean
    children: TreeviewItem[]

    match?: { start: number, end: number }
}

export const defaultTreeviewItem: TreeviewItem = {
    id: 1,
    name: "Organism",
    nameExtra: "no rank",
    highlighted: false,
    children: []
}

export type Size = 'x-small' | 'small' | 'default' | 'large' | 'x-large';
</script>

<style scoped>
.text {
    padding-left: 4px;
}

.text.x-small {
    font-size: x-small !important;
}

.text.small {
    font-size: small !important;
}

.text.default {
}

.text.large {
    font-size: large !important;
}

.text.x-large {
    font-size: x-large !important;
}
</style>
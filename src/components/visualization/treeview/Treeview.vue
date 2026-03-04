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
                @click="handleExpandClick"
            />
            <open
                v-else-if="hasChildren && !isExpanded"
                style="cursor: pointer;"
                :size="size"
                @click="handleExpandClick"
            />

            <treeview-check-box
                v-if="selectable && depth > 0 && node.selectable !== false"
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
                    <span v-if="node.nameExtra"> (<span v-if="node.nameExtraMatch"><span>{{ node.nameExtra.slice(0, node.nameExtraMatch.start) }}</span><b :style="{ color: '#306ccf' }">{{ node.nameExtra.slice(node.nameExtraMatch.start, node.nameExtraMatch.end) }}</b><span>{{ node.nameExtra.slice(node.nameExtraMatch.end) }}</span></span><span v-else>{{ node.nameExtra }}</span>)</span>
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
                :expanded="childExpanded"
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

// When the user manually opens a node, pass `depth` to children so only the
// immediate level expands (single-level expand).  Programmatic prop changes
// (e.g. search) reset this so the full expansion depth is restored.
const manuallyToggled = ref(false);
const childExpanded = computed<boolean | number>(() => manuallyToggled.value ? depth : expanded);

const handleExpandClick = () => {
    if (!isExpanded.value) {
        // Opening via user click – limit children to a single level
        manuallyToggled.value = true;
    }
    isExpanded.value = !isExpanded.value;
};

watch(() => expanded, (newValue) => {
    isExpanded.value = Number.isInteger(newValue) ? newValue as number > depth : newValue as boolean;
    manuallyToggled.value = false;
});

// Sync checkbox state → selectedItems model
watch(itemSelected, (selected) => {
    if (node.selectable === false) return;
    if (selected) {
        if (!selectedItems.value.some(item => item.id === node.id)) {
            selectedItems.value = [...selectedItems.value, node];
        }
    } else {
        selectedItems.value = selectedItems.value.filter(item => item.id !== node.id);
    }
});

// Sync selectedItems model → checkbox state (e.g. external clear)
watch(selectedItems, (items) => {
    if (node.selectable === false) return;
    itemSelected.value = items.some(item => item.id === node.id);
});
</script>

<script lang="ts">
export interface TreeviewItem {
    id: number
    name: string
    children: TreeviewItem[]

    nameExtra?: string
    highlighted?: boolean
    match?: { start: number, end: number }
    nameExtraMatch?: { start: number, end: number }
    selectable?: boolean
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
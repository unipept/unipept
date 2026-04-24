<template>
    <div>
        <div v-if="ecClasses.length === 0" class="text-caption text-medium-emphasis py-2">
            No EC numbers in this analysis.
        </div>
        <template v-else>
            <v-text-field
                v-model="searchQuery"
                placeholder="Search EC numbers or names..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                hide-details
                class="mb-2"
                @click:clear="searchQuery = ''"
            />
            <div v-if="localSelected.length > 0" class="mb-2">
                <div class="d-flex flex-wrap ga-1">
                    <v-chip
                        v-for="item in displayedChips"
                        :key="item.id"
                        size="x-small"
                        closable
                        :color="ecChipColor(item.name)"
                        @click:close="removeEc(item)"
                    >
                        {{ item.name }}
                    </v-chip>
                    <v-chip
                        v-if="hiddenCount > 0"
                        size="x-small"
                        style="cursor: pointer;"
                        @click="showMore"
                    >
                        +{{ hiddenCount }} more
                    </v-chip>
                </div>
                <div class="d-flex justify-end mt-1">
                    <v-btn size="x-small" variant="text" color="error" @click="clearAllEcs">Clear all</v-btn>
                </div>
            </div>
            <div v-if="displayedClasses.length === 0" class="text-caption text-medium-emphasis py-2">
                No EC numbers match your search.
            </div>
            <div v-else class="treeview-scroll">
                <treeview
                    v-for="cls in displayedClasses"
                    :key="cls.id"
                    :items="localSelected"
                    :node="cls"
                    :expanded="expansionLevel"
                    :max="Number.MAX_SAFE_INTEGER"
                    size="small"
                    @update:items="onItemsUpdate"
                />
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Treeview, { TreeviewItem } from '@/components/visualization/treeview/Treeview.vue';
import { ecChipColor, useEcNumbers } from '@/composables/treeview/useEcNumbers';

const props = defineProps<{
    ecIds: string[];
    modelValue: string[];
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string[]];
}>();

const searchQuery = ref('');

const { ecToNumericId, numericIdToEc, ecClasses } = useEcNumbers(() => props.ecIds);

const filterNode = (node: TreeviewItem, q: string): TreeviewItem | null => {
    // Try matching this node itself (leaf or intermediate)
    const namePos = node.name.toLowerCase().indexOf(q);
    const extraPos = (node.nameExtra ?? '').toLowerCase().indexOf(q);

    if (node.children.length === 0) {
        // Leaf: match by name or nameExtra
        if (namePos < 0 && extraPos < 0) return null;
        return {
            ...node,
            ...(namePos >= 0 ? { match: { start: namePos, end: namePos + q.length } } : {}),
            ...(extraPos >= 0 ? { nameExtraMatch: { start: extraPos, end: extraPos + q.length } } :
                {}),
        };
    }

    // Interior node: keep if any child survives
    const filteredChildren = node.children.flatMap(child => {
        const result = filterNode(child, q);
        return result ? [result] : [];
    });
    if (filteredChildren.length === 0) return null;
    return { ...node, children: filteredChildren };
};

const displayedClasses = computed<TreeviewItem[]>(() => {
    const q = (searchQuery.value ?? '').trim().toLowerCase();
    if (!q) return ecClasses.value;
    return ecClasses.value.flatMap(cls => {
        const result = filterNode(cls, q);
        return result ? [result] : [];
    });
});

// Expand all levels when a search is active
const expansionLevel = computed<boolean | number>(() => (searchQuery.value ?? '').trim() ? 3 : false);

// Recursive search for a node by ID
const findById = (nodes: TreeviewItem[], id: number): TreeviewItem | undefined => {
    for (const node of nodes) {
        if (node.id === id) return node;
        const found = findById(node.children, id);
        if (found) return found;
    }
    return undefined;
};

// Recursive search for an intermediate node by name (e.g. "1.1.1.-")
const findByName = (nodes: TreeviewItem[], name: string): TreeviewItem | undefined => {
    for (const node of nodes) {
        if (node.name === name) return node;
        const found = findByName(node.children, name);
        if (found) return found;
    }
    return undefined;
};

const selectedToItems = (ecStrings: string[]): TreeviewItem[] =>
    ecStrings.flatMap(ecId => {
        const numId = ecToNumericId.value.get(ecId);
        if (numId !== undefined) {
            const item = findById(ecClasses.value, numId);
            return item ? [item] : [];
        }
        // Intermediate node (e.g. "1.1.1.-") — look up by name
        const intermediate = findByName(ecClasses.value, ecId);
        return intermediate ? [intermediate] : [];
    });

const localSelected = ref<TreeviewItem[]>(selectedToItems(props.modelValue));

watch(() => props.modelValue, (newVal) => {
    localSelected.value = selectedToItems(newVal);
});

watch(() => props.ecIds, () => {
    localSelected.value = selectedToItems(props.modelValue);
});

const onItemsUpdate = (items: TreeviewItem[]) => {
    localSelected.value = items;
    // Leaf nodes → EC string; intermediate nodes → use name directly (e.g. "1.1.1.-")
    const ecStrings = items
        .map(item => item.children.length === 0 ? numericIdToEc.value.get(item.id) : item.name)
        .filter((ec): ec is string => ec !== undefined);
    emit('update:modelValue', ecStrings);
};

const removeEc = (item: TreeviewItem) => {
    onItemsUpdate(localSelected.value.filter(i => i.id !== item.id));
};

const visibleChipCount = ref(10);
const displayedChips = computed(() => localSelected.value.slice(0, visibleChipCount.value));
const hiddenCount = computed(() => Math.max(0, localSelected.value.length - visibleChipCount.value));
const showMore = () => { visibleChipCount.value += 5; };
const clearAllEcs = () => {
    visibleChipCount.value = 10;
    onItemsUpdate([]);
};
</script>

<style scoped>
.treeview-scroll {
    max-height: 260px;
    overflow-y: auto;
    padding: 4px 0;
}
</style>

<template>
    <div>
        <div class="d-flex align-center mb-2 ga-2">
            <v-text-field
                v-model="searchQuery"
                label="Search for a taxon or rank"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                @update:model-value="onSearch"
            />
            <slot name="append-search" />
        </div>

        <div class="treeview-container">
            <div v-if="loading" class="d-flex flex-column align-center justify-center" style="height: 100%;">
                <v-progress-circular indeterminate color="primary" size="36" />
                <span class="text-caption text-medium-emphasis mt-3">Loading taxa...</span>
            </div>

            <div v-else-if="treeError" class="d-flex align-center justify-center" style="height: 100%;">
                <span class="text-caption text-medium-emphasis">Could not load taxonomy tree.</span>
            </div>

            <treeview
                v-else-if="treeLoaded"
                :items="localSelected"
                :node="filteredTree"
                :expanded="expandDepth"
                :max="max"
                size="small"
                @update:items="onItemsUpdate"
            />

            <div v-else class="d-flex align-center justify-center" style="height: 100%;">
                <span class="text-caption text-medium-emphasis">No taxa found for this pathway.</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import Treeview, { TreeviewItem } from '@/components/visualization/treeview/Treeview.vue';
import useTreeFilter, { FilteredTree } from '@/composables/useTreeFilter';
import UnipeptCommunicator from '@/logic/communicators/unipept/UnipeptCommunicator';

const RANKS = [
    'no rank', 'superkingdom', 'kingdom', 'phylum', 'class',
    'order', 'family', 'genus', 'species', 'strain'
];

const props = withDefaults(defineProps<{
    taxonIds: number[];
    modelValue: TreeviewItem[];
    max?: number;
}>(), {
    max: 6
});

const emit = defineEmits<{
    'update:modelValue': [value: TreeviewItem[]];
}>();

const loading = ref(false);
const treeError = ref(false);
const treeLoaded = ref(false);
const searchQuery = ref('');
const DEFAULT_EXPAND_DEPTH = 3;
const SEARCH_EXPAND_DEPTH = 25;
const expandDepth = ref(DEFAULT_EXPAND_DEPTH);
const localSelected = ref<TreeviewItem[]>(props.modelValue);

const placeholder: FilteredTree = { id: 0, name: '', nameExtra: '', children: [], extra: null };
const { filteredTree, filter, update } = useTreeFilter(placeholder);

const communicator = new UnipeptCommunicator();

const _compressRankTree = (tree: any, taxa: number[]): FilteredTree[] => {
    tree.highlighted = taxa.includes(tree.id) && tree.id !== 1;

    const updatedChildren: FilteredTree[] = [];
    for (const child of tree.children ?? []) {
        updatedChildren.push(..._compressRankTree(child, taxa));
    }

    if (RANKS.includes(tree.rank)) {
        tree.children = updatedChildren;
        tree.nameExtra = tree.rank;
        tree.extra = null;
        return [tree as FilteredTree];
    } else {
        return updatedChildren;
    }
};

const compressRankTree = (tree: any, taxa: number[]): FilteredTree => {
    return _compressRankTree(JSON.parse(JSON.stringify(tree)), taxa)[0];
};

const onSearch = (val: string) => {
    filter(val ?? '');
    expandDepth.value = val ? SEARCH_EXPAND_DEPTH : DEFAULT_EXPAND_DEPTH;
};

const onItemsUpdate = (items: TreeviewItem[]) => {
    localSelected.value = items;
    emit('update:modelValue', items);
};

watch(() => props.modelValue, (newVal) => {
    localSelected.value = newVal;
});

const loadTree = async () => {
    if (!props.taxonIds.length) {
        treeLoaded.value = false;
        return;
    }

    loading.value = true;
    treeError.value = false;
    try {
        const tree = await communicator.taxa2tree(props.taxonIds.map(String));
        const compressed = compressRankTree(tree, props.taxonIds);
        update(compressed);
        treeLoaded.value = true;
    } catch {
        treeError.value = true;
        treeLoaded.value = false;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    if (props.taxonIds.length > 0) loadTree();
});

watch(() => props.taxonIds, async (newIds, oldIds) => {
    const sameIds = newIds.length === oldIds?.length
        && newIds.every((id, i) => id === oldIds[i]);
    if (!sameIds) {
        searchQuery.value = '';
        expandDepth.value = DEFAULT_EXPAND_DEPTH;
        await loadTree();
    }
}, { deep: true });
</script>

<style scoped>
.treeview-container {
    height: 250px;
    overflow-y: auto;
    padding: 4px 0;
}
</style>

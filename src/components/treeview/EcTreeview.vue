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
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';

const EC_CLASSES = [
    { prefix: '1', label: 'Oxidoreductases' },
    { prefix: '2', label: 'Transferases' },
    { prefix: '3', label: 'Hydrolases' },
    { prefix: '4', label: 'Lyases' },
    { prefix: '5', label: 'Isomerases' },
    { prefix: '6', label: 'Ligases' },
    { prefix: '7', label: 'Translocases' },
];

const props = defineProps<{
    ecIds: string[];
    modelValue: string[];
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string[]];
}>();

const mappingStore = usePathwayPilotMappingStore();
const searchQuery = ref('');

// Stable numeric ID per EC string (leaf nodes)
const ecToNumericId = computed<Map<string, number>>(() => {
    const sorted = [...props.ecIds].sort();
    const map = new Map<string, number>();
    sorted.forEach((ecId, i) => map.set(ecId, 100 + i));
    return map;
});

const numericIdToEc = computed<Map<number, string>>(() =>
    new Map([...ecToNumericId.value.entries()].map(([ec, id]) => [id, ec]))
);

// Sort map entries numerically by key (handles '-' as last)
const numericKeySort = (a: [string, unknown], b: [string, unknown]) =>
    a[0] === '-' ? 1 : b[0] === '-' ? -1 : parseInt(a[0]) - parseInt(b[0]);

const ecClasses = computed<TreeviewItem[]>(() => {
    let intermediateId = 100_000;

    return EC_CLASSES.map((cls, i) => {
        const classEcIds = props.ecIds
            .filter(id => id.startsWith(cls.prefix + '.'))
            .sort();

        if (classEcIds.length === 0) return null;

        const subclassMap = new Map<string, string[]>();
        for (const ecId of classEcIds) {
            const parts = ecId.split('.');
            const sub = parts[1] ?? '-';
            if (!subclassMap.has(sub)) subclassMap.set(sub, []);
            subclassMap.get(sub)!.push(ecId);
        }

        const subclassItems: TreeviewItem[] = [];
        for (const [sub, subEcIds] of [...subclassMap.entries()].sort(numericKeySort)) {
            const subSubMap = new Map<string, string[]>();
            for (const ecId of subEcIds) {
                const parts = ecId.split('.');
                const subSub = parts[2] ?? '-';
                if (!subSubMap.has(subSub)) subSubMap.set(subSub, []);
                subSubMap.get(subSub)!.push(ecId);
            }

            const subSubItems: TreeviewItem[] = [];
            for (const [subSub, leafEcIds] of [...subSubMap.entries()].sort(numericKeySort)) {
                const leafItems: TreeviewItem[] = leafEcIds.sort().map(ecId => ({
                    id: ecToNumericId.value.get(ecId)!,
                    name: ecId,
                    nameExtra: mappingStore.ecMapping?.get(ecId)?.names?.[0] ?? 'Unknown',
                    children: [],
                }));

                subSubItems.push({
                    id: intermediateId++,
                    name: `${cls.prefix}.${sub}.${subSub}.-`,
                    children: leafItems,
                });
            }

            subclassItems.push({
                id: intermediateId++,
                name: `${cls.prefix}.${sub}.-.-`,
                children: subSubItems,
            });
        }

        return {
            id: i + 1,
            name: `EC ${cls.prefix}`,
            nameExtra: cls.label,
            children: subclassItems,
        } as TreeviewItem;
    }).filter((x): x is TreeviewItem => x !== null);
});

// When a search is active, filter the tree to only include matching paths
const displayedClasses = computed<TreeviewItem[]>(() => {
    const q = (searchQuery.value ?? '').trim().toLowerCase();
    if (!q) return ecClasses.value;

    return ecClasses.value.map(cls => {
        const subclassItems = cls.children.map(subclass => {
            const subSubItems = subclass.children.map(subSub => {
                const leaves = subSub.children.map(leaf => {
                    const namePos = leaf.name.toLowerCase().indexOf(q);
                    const extraPos = (leaf.nameExtra ?? '').toLowerCase().indexOf(q);
                    if (namePos < 0 && extraPos < 0) return null;
                    return {
                        ...leaf,
                        ...(namePos >= 0 ? { match: { start: namePos, end: namePos + q.length } } : {}),
                        ...(extraPos >= 0 ? { nameExtraMatch: { start: extraPos, end: extraPos + q.length } } : {}),
                    };
                }).filter((x): x is TreeviewItem => x !== null);
                if (leaves.length === 0) return null;
                return { ...subSub, children: leaves };
            }).filter((x): x is TreeviewItem => x !== null);
            if (subSubItems.length === 0) return null;
            return { ...subclass, children: subSubItems };
        }).filter((x): x is TreeviewItem => x !== null);
        if (subclassItems.length === 0) return null;
        return { ...cls, children: subclassItems };
    }).filter((x): x is TreeviewItem => x !== null);
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

// Chip colors per EC class (EC 1–7)
const EC_CLASS_CHIP_COLORS = [
    '#e53935', // EC 1 - Oxidoreductases
    '#1e88e5', // EC 2 - Transferases
    '#43a047', // EC 3 - Hydrolases
    '#fb8c00', // EC 4 - Lyases
    '#8e24aa', // EC 5 - Isomerases
    '#00897b', // EC 6 - Ligases
    '#f9a825', // EC 7 - Translocases
];

const ecChipColor = (ecName: string): string => {
    const classIdx = parseInt(ecName.charAt(0)) - 1;
    return classIdx >= 0 && classIdx < EC_CLASS_CHIP_COLORS.length
        ? EC_CLASS_CHIP_COLORS[classIdx]
        : '#888888';
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

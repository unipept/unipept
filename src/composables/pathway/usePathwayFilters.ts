import { ref, computed } from 'vue';

export interface FilterablePathwayItem {
    id: string;
    category: string;
    subCategory: string;
    name: string;
}

export interface PathwayFiltersOptions<T extends FilterablePathwayItem> {
    items: () => T[];
    pathwaysForEc: (ec: string) => Set<string>;
    pathwaysForCompound: (c: string) => Set<string>;
    allEcs: () => Iterable<string>;
}

export function usePathwayFilters<T extends FilterablePathwayItem>(options: PathwayFiltersOptions<T>) {
    const search = ref('');
    const page = ref(1);
    const filterDialog = ref(false);

    const draftEcs = ref<string[]>([]);
    const draftCompounds = ref<string[]>([]);
    const draftCategories = ref<string[]>([]);

    const appliedEcs = ref<string[]>([]);
    const appliedCompounds = ref<string[]>([]);
    const appliedCategories = ref<string[]>([]);

    const availableEcIds = computed(() => Array.from(options.allEcs()).sort() as string[]);

    const activeFilterCount = computed(() =>
        appliedEcs.value.length + appliedCompounds.value.length + appliedCategories.value.length
    );

    const filterItems = (items: T[], ecs: string[], compounds: string[], categories: string[]): T[] => {
        if (ecs.length > 0) {
            const allowed = new Set<string>();
            for (const ec of ecs) {
                if (ec.endsWith('.-')) {
                    const prefix = ec.replace(/(\.-)+$/, '');
                    for (const storeEc of options.allEcs()) {
                        const storeEcStr = storeEc as string;
                        if (storeEcStr.startsWith(prefix + '.') || storeEcStr === prefix) {
                            for (const p of options.pathwaysForEc(storeEcStr)) allowed.add(p);
                        }
                    }
                } else {
                    for (const p of options.pathwaysForEc(ec)) allowed.add(p);
                }
            }
            items = items.filter(item => allowed.has(item.id));
        }

        if (compounds.length > 0) {
            const allowed = new Set<string>();
            for (const c of compounds) {
                for (const p of options.pathwaysForCompound(c)) allowed.add(p);
            }
            items = items.filter(item => allowed.has(item.id));
        }

        if (categories.length > 0) {
            const catSet = new Set(categories);
            items = items.filter(item => catSet.has(item.subCategory || item.category));
        }

        return items;
    };

    const previewFilteredCount = computed(() =>
        filterItems(options.items(), draftEcs.value, draftCompounds.value, draftCategories.value).length
    );

    const filteredItems = computed(() => {
        let items = filterItems(options.items(), appliedEcs.value, appliedCompounds.value, appliedCategories.value);
        if (search.value) {
            const q = search.value.toLowerCase();
            items = items.filter(item =>
                item.id.toLowerCase().includes(q) ||
                item.name.toLowerCase().includes(q) ||
                (item.category || '').toLowerCase().includes(q) ||
                (item.subCategory || '').toLowerCase().includes(q)
            );
        }
        return items;
    });

    const openFilterDialog = () => {
        draftEcs.value = [...appliedEcs.value];
        draftCompounds.value = [...appliedCompounds.value];
        draftCategories.value = [...appliedCategories.value];
        filterDialog.value = true;
    };

    const applyFilters = () => {
        appliedEcs.value = [...draftEcs.value];
        appliedCompounds.value = [...draftCompounds.value];
        appliedCategories.value = [...draftCategories.value];
        filterDialog.value = false;
    };

    const clearFilters = () => {
        draftEcs.value = [];
        draftCompounds.value = [];
        draftCategories.value = [];
    };

    return {
        search,
        page,
        filterDialog,
        draftEcs,
        draftCompounds,
        draftCategories,
        appliedEcs,
        appliedCompounds,
        appliedCategories,
        availableEcIds,
        activeFilterCount,
        previewFilteredCount,
        filteredItems,
        openFilterDialog,
        applyFilters,
        clearFilters,
    };
}

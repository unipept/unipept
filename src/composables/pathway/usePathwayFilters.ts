import { ref, computed, inject, type InjectionKey } from 'vue';
import { refDebounced } from '@vueuse/core';
import { filterPathways, searchPathways, type FilterablePathwayItem, type PathwayLookups } from '@/logic/pathway/PathwayFilters';

export interface PathwayFiltersOptions<T extends FilterablePathwayItem> extends PathwayLookups {
    items: () => T[];
}

export function usePathwayFilters<T extends FilterablePathwayItem>(options: PathwayFiltersOptions<T>) {
    const search = ref('');
    const debouncedSearch = refDebounced(search, 300);
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

    const previewFilteredCount = computed(() =>
        filterPathways(options.items(), draftEcs.value, draftCompounds.value, draftCategories.value, options).length
    );

    const filteredItems = computed(() => {
        const items = filterPathways(options.items(), appliedEcs.value, appliedCompounds.value, appliedCategories.value, options);
        return searchPathways(items, debouncedSearch.value);
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

export type PathwayFilters = ReturnType<typeof usePathwayFilters>;

// Provided by the component that creates the filters; read by PathwaySelectionTable and PathwaySelectionFilter.
export const pathwayFiltersKey: InjectionKey<PathwayFilters> = Symbol('pathwayFilters');

export function injectPathwayFilters(): PathwayFilters {
    const filters = inject(pathwayFiltersKey);
    if (!filters) {
        throw new Error('injectPathwayFilters() requires a parent component that provides pathwayFiltersKey');
    }
    return filters;
}

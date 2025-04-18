import {defineStore} from "pinia";
import {computed, ref, toRaw} from "vue";

export enum FilterType {
    Taxon,
    Proteome,
    Protein,
    UniProtKB,
}

export interface Filter {
    filter: FilterType;
    data?: number[] | string[];
}

const useCustomFilterStore = defineStore('customFilterStore', () => {
    const _filters = ref<Map<string, Filter>>(new Map());
    _filters.value.set('UniProtKB', { filter: FilterType.UniProtKB });

    const filters = computed(() => [ ..._filters.value.keys() ]);

    const getFilter = (key: string): Filter | undefined => {
        return _filters.value.get(key);
    }

    const addFilter = (key: string, filter: Filter) => {
        _filters.value.set(key, filter);
    }

    const removeFilter = (key: string) => {
        _filters.value.delete(key);
    }

    const hasFilter = (key: string): boolean => {
        return _filters.value.has(key);
    }

    const updateFilter = (oldKey: string, newKey: string, newFilter: Filter) => {
        _filters.value.delete(oldKey);
        _filters.value.set(newKey, newFilter);
    }

    const exportStore = (): CustomFilterStoreImport => {
        return Array.from(_filters.value.entries()).map(
            ([key, filter]) => [key, toRaw(filter)]);
    }

    const setImportedData = (storeImport: CustomFilterStoreImport) => {
        _filters.value.clear();
        storeImport.forEach(([key, filter]) => {
            _filters.value.set(key, filter);
        });
    }

    return {
        filters,

        getFilter,
        addFilter,
        removeFilter,
        hasFilter,
        updateFilter,
        exportStore,
        setImportedData
    };
});

export type CustomFilterStoreImport = [string, Filter][];

export const useCustomFilterStoreImport = (storeImport: CustomFilterStoreImport) => {
    const store = useCustomFilterStore();
    store.setImportedData(storeImport);
}

export type CustomFilterStore = ReturnType<typeof useCustomFilterStore>;

export default useCustomFilterStore;

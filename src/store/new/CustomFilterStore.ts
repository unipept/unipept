import {defineStore} from "pinia";
import {computed, ref} from "vue";

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

    const hasFilter = (key: string): boolean => {
        return _filters.value.has(key);
    }

    const exportStore = (): CustomFilterStoreImport => {
        return Array.from(_filters.value.entries()).map(
            ([key, filter]) => [key, { ...filter }]);
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
        hasFilter,
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

import {defineStore} from "pinia";
import {computed, ref, toRaw} from "vue";

export const UNIPROT_ID = 'UniProtKB';

export enum FilterType {
    Taxon,
    Proteome,
    Protein,
    UniProtKB,
}

export interface Filter {
    filter: FilterType;
    name: string;
    data?: number[] | string[];
}

const useCustomFilterStore = defineStore('customFilterStore', () => {
    const _filters = ref<Map<string, Filter>>(new Map());
    _filters.value.set(UNIPROT_ID, { filter: FilterType.UniProtKB, name: 'UniProtKB' });

    const filters = computed(() => [ ..._filters.value.keys() ]);
    const filterNames = computed(() => [ ..._filters.value.values() ].map(f => f.name));

    const getFilterNameById = (id: string): string | undefined => {
        const filter = _filters.value.get(id);
        return filter ? filter.name : undefined;
    }

    const getFilterById = (id: string): Filter | undefined => {
        return _filters.value.get(id);
    }

    const addFilter = (filter: Filter): string => {
        const filterId = crypto.randomUUID();
        _filters.value.set(filterId, filter);
        return filterId;
    }

    const removeFilterById = (id: string) => {
        _filters.value.delete(id);
    }

    const hasFilterById = (id: string): boolean => {
        return _filters.value.has(id);
    }

    const hasFilterByName = (name: string): boolean => {
        return [ ..._filters.value.values() ].filter(f => f.name === name).length > 0;
    }

    const updateFilterById = (id: string, newFilter: Filter) => {
        _filters.value.set(id, newFilter);
    }

    const clear = () => {
        _filters.value.clear();
        _filters.value.set(UNIPROT_ID, { filter: FilterType.UniProtKB, name: 'UniProtKB' });
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
        filterNames,

        getFilterNameById,
        getFilterById,
        addFilter,
        removeFilterById,
        hasFilterById,
        hasFilterByName,
        updateFilterById,
        clear,
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

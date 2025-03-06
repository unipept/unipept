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

    return {
        filters,

        getFilter,
        addFilter,
        hasFilter
    };
});

export type CustomFilterStore = ReturnType<typeof useCustomFilterStore>;

export default useCustomFilterStore;

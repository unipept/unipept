import { ref, Ref } from "vue";

export interface LoadItemsParams {
    page: number;
    itemsPerPage: number;
    sortBy: { key: string, order: "asc" | "desc" }[];
}

function useBrowserLoader<IdType, T>() {
    const loading = ref(true);
    const items = ref<T[]>([]);
    const itemsLength = ref(0);
    const filterValue = ref("");

    const load = async function(
        loadItemsParams: LoadItemsParams,
        updateOntology: (ids: IdType[]) => Promise<void>,
        ontology: Map<IdType, T>,
        getRange: (start: number, end: number, filter?: string, sortByColumn?: string, sortDesc?: boolean) => Promise<IdType[]>,
        getCount: (filter: string) => Promise<number>
    ) {
        loading.value = true;

        let sortByColumn: string | undefined = undefined;
        let sortDesc = false;
        if (loadItemsParams.sortBy && loadItemsParams.sortBy.length > 0) {
            sortByColumn = loadItemsParams.sortBy[0].key.toLowerCase();
            sortDesc = loadItemsParams.sortBy[0].order === "desc";
        }

        const idsInRange = await getRange(
            (loadItemsParams.page - 1) * loadItemsParams.itemsPerPage,
            loadItemsParams.page * loadItemsParams.itemsPerPage,
            filterValue.value,
            sortByColumn,
            sortDesc
        );

        await updateOntology(idsInRange);

        const processedItems: T[] = [];
        for (const id of idsInRange) {
            processedItems.push(ontology.get(id)!);
        }

        const total = await getCount(filterValue.value);

        items.value = processedItems;
        itemsLength.value = total;
        loading.value = false;
    };

    const clearSearch = () => {
        filterValue.value = "";
    };

    return {
        loading,
        items,
        itemsLength,
        filterValue,
        load,
        clearSearch,
    };
}

export default useBrowserLoader;
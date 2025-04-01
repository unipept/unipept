import { ref, Ref } from "vue";
import {refDebounced} from "@vueuse/core";
import useAsync from "@/composables/useAsync";

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
    
    const { performIfLast } = useAsync<{ items: T[], total: number }>();

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

        // By wrapping this in the `performIfLast` function we make sure that slow requests don't overwrite the results
        // of more recent, faster requests.
        await performIfLast(
            async () => {
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

                return {
                    items: processedItems,
                    total
                };
            },
            (result) => {
                items.value = result.items;
                itemsLength.value = result.total;
            }
        );

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
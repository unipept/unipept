import { ref, Ref, computed, watch } from "vue";

/**
 * This is a composable that contains logic that is shared between the different Browser components (such as
 * TaxaBrowser or ReferenceProteomeBrowser).
 *
 * @param initialSelected Optional, a list of items that are already selected when the browser opens.
 */
export default function useBrowserSelection<IdType, T extends { id: IdType }>(initialSelected: T[] = []) {
    // List of items that are currently selected in the browser. We need to perform a type cast here since Vue does not
    // correctly recognize the type extension of the template parameter T here.
    const selectedItems = ref<T[]>(initialSelected) as Ref<T[]>;
    // IDs of items that were uploaded in bulk through a file, but that are not a valid identifier for the ontology
    // that's presented by the current browser.
    const invalidItems = ref<string[]>([]);

    const selectItem = (item: T) => {
        const idx = selectedItems.value.findIndex((element) => element.id === item.id);
        if (idx === -1) {
            selectedItems.value.push(item);
        } else {
            selectedItems.value.splice(idx, 1);
        }
        selectedItems.value = [...selectedItems.value];
    };

    const clearSelection = () => {
        selectedItems.value = [];
        invalidItems.value = [];
    };

    const itemSelected = (item: T) => selectedItems.value.some((i) => i.id === item.id);

    /**
     * Asynchronously processes and uploads a file containing IDs, updates an ontology map,
     * and manages selected and invalid items based on the file content and input validation.
     *
     * @param file The file to be uploaded and processed. The file content should contain a list of IDs, each separated
     * by a new line.
     * @param ontology A map containing ontology data where each key is an ID and its value represents associated data.
     * @param updateOntology A function that updates the ontology with validated IDs.
     * @param checkValidity A function to validate a list of IDs. Should return a tuple with two lists. The first list
     * represents the valid IDs and the second list the rejected IDs.
     * valid item, false otherwise.
     */
    const uploadFile = async (
        file: File,
        ontology: Map<IdType, T>,
        updateOntology: (ids: IdType[]) => Promise<void>,
        checkValidity: (ids: string[]) => Promise<[IdType[], string[]]>
    ) => {
        // Reset the invalid items that were encountered during a previous processed upload.
        invalidItems.value = [];

        const ids = (await file.text())
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        const [validIds, invalidIds] = await checkValidity(ids);
        invalidItems.value = invalidIds;

        await updateOntology(validIds);

        for (const id of validIds) {
            if (selectedItems.value.every((item) => item.id !== id)) {
                selectedItems.value.push(ontology.get(id)!);
            }
        }
    };

    return {
        selectedItems,
        invalidItems,
        selectItem,
        clearSelection,
        itemSelected,
        uploadFile,
    };
}
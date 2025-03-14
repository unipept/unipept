<template>
    <div>
        <database-summary
            title="Selected reference proteomes"
            description="This is a summary of all reference proteomes that have been selected for inclusion in your database. Proteins from UniProtKB that are associated to any of these reference proteomes will be included in the final database."
            empty-placeholder="No proteomes selected yet. Please select reference proteomes from the table below."
            v-model:selected-items="selectedItems"
            v-model:invalid-items="invalidItems"
            :compute-protein-count="computeProteinCount"
            :compute-taxon-count="computeTaxaCount"
            :chip-background-color="(_item: ReferenceProteome) => 'primary'"
            :item-display-name="(item: ReferenceProteome) => item.id"
            @clear-selection="clearSelection"
            @upload-file="processUploadedProteomes"
            class="mb-2"
        />

        <v-card style="width: 100%;">
            <v-card-text>
                <h3>Reference proteome browser</h3>

                <v-data-table-server
                    :headers="headers"
                    :items="proteomes"
                    :items-length="proteomesLength"
                    :items-per-page="5"
                    :loading="proteomesLoading"
                    :search="filterValue"
                    @update:options="loadProteomes"
                    density="comfortable"
                    color="primary"
                >
                    <template #footer.prepend>
                        <v-text-field
                            v-model="filterValue"
                            class="mr-6"
                            color="primary"
                            prepend-inner-icon="mdi-magnify"
                            clearable
                            clear-icon="mdi-close"
                            label="Search"
                            density="compact"
                            variant="outlined"
                            hide-details
                            @click:clear="clearSearch"
                        />
                    </template>
                    <template #item.action="{ item }">
                        <v-btn
                            v-if="itemSelected(item)"
                            color="red"
                            density="compact"
                            variant="text"
                            prepend-icon="mdi-minus"
                            @click="selectItem(item)"
                        >
                            Remove
                        </v-btn>

                        <v-btn
                            v-else
                            color="primary"
                            density="compact"
                            variant="text"
                            prepend-icon="mdi-plus"
                            @click="selectItem(item)"
                        >
                            Select
                        </v-btn>
                    </template>
                </v-data-table-server>

                <div class="text-caption mt-n2 mb-2 ml-1">
                    <span>Hint:</span>
                    enter a keyword to search for proteomes. You can search by reference proteome ID or organism name.
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import ReferenceProteome from "@/logic/ontology/proteomes/ReferenceProteome";
import ProteomeCommunicator from "@/logic/communicators/unipept/proteome/ProteomeCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import useProteomeOntology from "@/composables/ontology/useProteomeOntology";
import DatabaseSummary from "@/components/browsers/DatabaseSummary.vue";
import useDatabaseSummary from "@/components/browsers/useDatabaseSummary";
import useBrowserLoader, {LoadItemsParams} from "@/components/browsers/useBrowserLoader";

// TODO remove any type whenever Vuetify 3 exposes the DataTableHeader type
const headers: any = [
    {
        title: "Reference Proteome ID",
        align: "start",
        value: "id",
        width: "20%",
        sortable: true
    },
    {
        title: "Organism Name",
        align: "start",
        value: "taxonName",
        width: "40%",
        sortable: true
    },
    {
        title: "Protein Count",
        align: "start",
        value: "proteinCount",
        width: "20%",
        sortable: true
    },
    {
        title: "",
        align: "left",
        value: "action",
        width: "20%",
        sortable: false
    }
];

// Commonly reused logic and values extracted from composable
const selectedItems = defineModel<ReferenceProteome[]>({default: []});

const {
    uploadFile: uploadProteomeFile,
    invalidItems,
    selectItem,
    clearSelection,
    itemSelected
} = useDatabaseSummary<string, ReferenceProteome>(selectedItems);

const { ontology: proteomeOntology, update: updateProteomeOntology } = useProteomeOntology();

// Logic for loading reference proteomes and showing them in the browser table
const {
    loading: proteomesLoading,
    items: proteomes,
    itemsLength: proteomesLength,
    load: loadProteomesForBrowser,
    filterValue,
    clearSearch
} = useBrowserLoader<string, ReferenceProteome>();

const proteomeCommunicator = new ProteomeCommunicator(DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE);

const loadProteomes = async (params: LoadItemsParams) => {
    await loadProteomesForBrowser(
        params,
        updateProteomeOntology,
        proteomeOntology,
        (start: number, end: number, filter?: string, sortByColumn?: string, sortDesc?: boolean) => proteomeCommunicator.getProteomeRange(start, end, filter, sortByColumn as any, sortDesc),
        (filter) => proteomeCommunicator.getProteomeCount(filter)
    )
}

// Uploading and processing reference proteomes from file
const processUploadedProteomes = async (file: File, callback: () => void) => {
    await uploadProteomeFile(
        file,
        proteomeOntology,
        updateProteomeOntology,
        async (ids: string[]) => {
            // A provided reference proteome ID is valid if it is known by UniProt
            const validIds: string[] = [];
            const invalidIds: string[] = [];

            await updateProteomeOntology(ids);

            // Now check which of all ids is present in the ontology
            for (const id of ids) {
                if (proteomeOntology.has(id)) {
                    validIds.push(id);
                } else {
                    invalidIds.push(id);
                }
            }

            return [validIds, invalidIds];
        }
    );

    // File has been processed, notify component that we're done
    callback();
}

// Logic for counting proteins and taxa associated with the resulting database
const computeProteinCount = async () => {
    return selectedItems.value.reduce((acc, proteome) => acc + proteome.proteinCount, 0);
};

const computeTaxaCount = async () => {
    return new Set(selectedItems.value.map(proteome => proteome.taxonId)).size;
}
</script>

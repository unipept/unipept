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
import {ref} from "vue";
import ProteomeCommunicator from "@/logic/communicators/unipept/proteome/ProteomeCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import useProteomeOntology from "@/composables/ontology/useProteomeOntology";
import DatabaseSummary from "@/components/browsers/DatabaseSummary.vue";
import useBrowserSelection from "@/components/browsers/useBrowserSelection";

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
const {
    uploadFile: uploadProteomeFile,
    selectedItems,
    invalidItems,
    selectItem,
    clearSelection,
    itemSelected
} = useBrowserSelection<string, ReferenceProteome>();

// Logic for loading reference proteomes and showing them in the browser table
interface LoadItemsParams {
    page: number;
    itemsPerPage: number;
    sortBy: { key: string, order: "asc" | "desc" }[];
}

const proteomesLoading = ref<boolean>(true);
const proteomes = ref<ReferenceProteome[]>([]);
const proteomesLength = ref<number>(0);

const filterValue = ref("");

const proteomeCommunicator = new ProteomeCommunicator(DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE);
const { ontology: proteomeOntology, update: updateProteomeOntology } = useProteomeOntology();

const loadProteomes = async function({ page, itemsPerPage, sortBy }: LoadItemsParams) {
    proteomesLoading.value = true;
    proteomesLength.value = await proteomeCommunicator.getProteomeCount(filterValue.value);

    // Retrieve the IDs of the taxa that are present in the given range.
    let sortByColumn: "id" | "protein_count" | "taxon_name" | undefined = undefined;
    let sortDesc = false;
    if (sortBy && sortBy.length > 0) {
        sortByColumn = sortBy[0].key.toLowerCase()
            .replace("count", "_count")
            .replace("name", "_name") as ("id" | "protein_count" | "taxon_name" | undefined);
        sortDesc = sortBy[0].order === "desc";
    }

    const proteomeIdsInRange = await proteomeCommunicator.getProteomeRange(
        (page - 1) * itemsPerPage,
        page * itemsPerPage,
        filterValue.value,
        sortByColumn,
        sortDesc
    )

    await updateProteomeOntology(proteomeIdsInRange);

    proteomes.value = [];
    for (const proteomeId of proteomeIdsInRange) {
        proteomes.value.push(proteomeOntology.get(proteomeId)!);
    }

    proteomesLoading.value = false;
}

const clearSearch = () => filterValue.value = "";

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

<style scoped>
.settings-text {
    font-size: 14px;
    color: rgba(0,0,0,.6);
}
</style>
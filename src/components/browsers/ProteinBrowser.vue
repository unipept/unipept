<template>
    <div>
        <database-summary
            title="Selected proteins"
            description="This is a summary of all proteins that have been selected for inclusion in your database."
            empty-placeholder="No proteins selected yet. Select at least one protein from the table below to continue."
            v-model:selected-items="selectedItems"
            v-model:invalid-items="invalidItems"
            :chip-background-color="(_item: Protein) => 'primary'"
            :item-display-name="(protein: Protein) => protein.id"
            :compute-protein-count="computeProteinCount"
            :compute-taxon-count="computeTaxonCount"
            @upload-file="processUploadedProteins"
            class="mb-2"
        />

        <v-card style="width: 100%;">
            <v-card-text>
                <h3>Protein browser</h3>

                <v-data-table-server
                    :headers="headers"
                    :items="proteins"
                    :items-length="proteinsLength"
                    :items-per-page="5"
                    :loading="proteinsLoading"
                    :search="filterValue"
                    density="compact"
                    @update:options="loadProteins"
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
                <div class="text-caption mt-n2 ml-1">
                    <span>Hint:</span>
                    enter a keyword to search for proteins. You can search by name, accession ID, organism ID or database type.
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import Protein from "@/logic/ontology/proteins/Protein";
import useDatabaseSummary from "@/components/browsers/useDatabaseSummary";
import useProteinOntology from "@/composables/ontology/useProteinOntology";
import useBrowserLoader, {LoadItemsParams} from "@/components/browsers/useBrowserLoader";
import ProteinResponseCommunicator from "@/logic/communicators/unipept/protein/ProteinResponseCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import DatabaseSummary from "@/components/browsers/DatabaseSummary.vue";

// TODO remove any type whenever Vuetify 3 exposes the DataTableHeader type
const headers: any = [
    {
        title: "UniProt Accession ID",
        align: "start",
        value: "id",
        width: "20%",
        sortable: true
    },
    {
        title: "Name",
        align: "start",
        value: "name",
        width: "30%",
        sortable: true
    },
    {
        title: "Taxon ID",
        align: "start",
        value: "taxonId",
        width: "20%",
        sortable: true
    },
    {
        title: "Database Type",
        align: "start",
        value: "databaseType",
        width: "15%",
        sortable: true
    },
    {
        title: "",
        align: "start",
        value: "action",
        width: "15%",
        sortable: false
    }
];

// Commonly reused logic and values extracted from composable
const selectedItems = defineModel<Protein[]>({default: []});

const {
    uploadFile: uploadProteinFile,
    invalidItems,
    selectItem,
    clearSelection,
    itemSelected
} = useDatabaseSummary<string, Protein>(selectedItems);

const {ontology: proteinOntology, update: updateProteinOntology} = useProteinOntology();

// Start of logic that handles presentation and UI of the component
const processUploadedProteins = async (file: File, callback: () => void) => {
    await uploadProteinFile(
        file,
        proteinOntology,
        updateProteinOntology,
        async (ids: string[]) => {
            // A provided protein ID is valid if it's known by the UniProtKB database
            await updateProteinOntology(ids);

            const validIds: string[] = [];
            const invalidIds: string[] = [];

            for (const id of ids) {
                if (proteinOntology.has(id)) {
                    validIds.push(id);
                } else {
                    invalidIds.push(id);
                }
            }

            return [validIds, invalidIds];
        }
    );

    callback();
}

// Logic for loading proteins and showing them in the browser table
const {
    loading: proteinsLoading,
    items: proteins,
    itemsLength: proteinsLength,
    load: loadProteinsForBrowser,
    filterValue,
    clearSearch
} = useBrowserLoader<string, Protein>();

const proteinCommunicator = new ProteinResponseCommunicator(DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE);

const loadProteins = async (params: LoadItemsParams) => {
    await loadProteinsForBrowser(
        params,
        updateProteinOntology,
        proteinOntology,
        (start: number, end: number, filter?: string, sortByColumn?: string, sortDesc?: boolean) => proteinCommunicator.getProteinRange(start, end, filter, sortByColumn as any, sortDesc),
        (filter) => proteinCommunicator.getProteinCount(filter)
    );
}

// Logic responsible for computing the amount of proteins associated with the given proteins
const computeProteinCount = async () => {
    return selectedItems.value.length;
}

const computeTaxonCount = async () => {
    return new Set<number>(selectedItems.value.map(p => p.taxonId)).size;
}
</script>

<style scoped>

</style>
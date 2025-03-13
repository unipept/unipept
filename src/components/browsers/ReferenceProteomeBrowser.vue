<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div style="width: 100%;">
                    <v-data-table-server
                        :headers="headers"
                        :items="proteomes"
                        :items-length="proteomesLength"
                        :items-per-page="5"
                        :loading="proteomesLoading"
                        :search="filterValue"
                        density="compact"
                        @update:options="loadProteomes"
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
                                color="primary"
                                density="compact"
                                variant="text"
                                prepend-icon="mdi-plus"
                                :disabled="itemSelected(item)"
                                @click="selectItem(item)"
                            >
                                Add
                            </v-btn>
                        </template>
                    </v-data-table-server>
                </div>

                <div class="text-caption mb-2">
                    <span>Hint:</span>
                    enter a keyword to search for proteomes. You can search by reference proteome ID or organism name.
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
// TODO remove any type whenever Vuetify 3 exposes the DataTableHeader type
import ReferenceProteome from "@/logic/ontology/proteomes/ReferenceProteome";
import {ref} from "vue";
import ProteomeCommunicator from "@/logic/communicators/unipept/proteome/ProteomeCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import useProteomeOntology from "@/composables/ontology/useProteomeOntology";

const headers: any = [
    {
        title: "Reference Proteome ID",
        align: "start",
        value: "id",
        width: "39%",
        sortable: true
    },
    {
        title: "Organism Name",
        align: "start",
        value: "taxonName",
        width: "39%",
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
        width: "2%",
        sortable: false
    }
];

// Values that define UI behaviour of the component
const selectedItems = defineModel<ReferenceProteome[]>({default: []});

const selectItem = (item: ReferenceProteome) => {
    const idx = selectedItems.value.findIndex(element => element.id === item.id);
    if (idx === -1) {
        selectedItems.value.push(item)
    } else {
        selectedItems.value.splice(idx, 1);
    }
    selectedItems.value = [ ...selectedItems.value ];
}

const clearSelection = () => selectedItems.value = [];

const itemSelected = (item: ReferenceProteome) => selectedItems.value.some(i => i.id === item.id);

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
</script>

<style scoped>

</style>
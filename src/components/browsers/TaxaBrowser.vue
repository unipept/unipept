<template>
    <div>
        <v-card style="width: 100%;" class="mb-2">
            <v-card-text>
                <h3 class="mb-2">Database summary</h3>

                <div class="d-flex">
                    <v-col cols="8">
                        <h4>Selected taxa</h4>
                        <div class="text-caption">
                            This is a summary of all taxa that have been selected for inclusion in your database.
                            Proteins from UniProtKB that are associated to any of these taxa, or their descendants will be included in the final database.
                            If no taxa are selected here, the final database will contain all UniProtKB proteins (TrEMBL + SwissProt).
                        </div>
                        <div class="d-flex align-center mt-4">
                            <div
                                v-if="selectedItems.length === 0"
                                class="flex-grow-1 settings-text"
                            >
                                No taxa selected yet. No filtering will be applied. Select taxa from the table below.
                            </div>
                            <v-chip-group
                                v-else
                                column
                                class="flex-grow-1 d-flex"
                                style="column-gap: 5px;"
                            >
                                <v-chip
                                    v-for="taxon in selectedItems"
                                    :key="taxon.id"
                                    :class="`bg-${getRankColor(taxon.rank)}`"
                                    closable
                                    variant="flat"
                                    @click:close="selectItem(taxon)"
                                >
                                    {{ taxon.name }}
                                </v-chip>
                            </v-chip-group>
                            <v-tooltip
                                location="bottom"
                                open-delay="500"
                            >
                                <template #activator="{ props }">
                                    <v-btn
                                        v-bind="props"
                                        class="mr-2"
                                        style="align-self: start;"
                                        variant="outlined"
                                        color="primary"
                                        prepend-icon="mdi-file-upload"
                                    >
                                        Upload from file
                                    </v-btn>
                                </template>
                                <span>Select taxa from a file containing taxa IDs (one per line).</span>
                            </v-tooltip>
                            <v-tooltip
                                location="bottom"
                                open-delay="500"
                            >
                                <template #activator="{ props }">
                                    <v-btn
                                        v-bind="props"
                                        variant="outlined"
                                        style="align-self: start;"
                                        color="error"
                                        @click="clearSelection"
                                        :disabled="selectedItems.length === 0"
                                    >
                                        Clear all
                                    </v-btn>
                                </template>
                                <span>Clear selection</span>
                            </v-tooltip>
                        </div>
                    </v-col>

                    <v-col cols="4">
                        <h4>Statistics</h4>
                        <div class="text-caption">
                            Final database composition statistics
                        </div>
                        <div class="d-flex align-center mt-2">
                            <v-icon class="mr-2">mdi-database</v-icon>
                            <span v-if="isExecuting">Computing protein count...</span>
                            <span v-else>{{ formattedUniprotRecordsCount }} proteins</span>
                        </div>
                        <div class="d-flex align-center">
                            <v-icon class="mr-2">mdi-bacteria</v-icon>
                            <span v-if="isExecuting">Computing taxon count...</span>
                            <span v-else>{{ formattedTaxaCount }} different taxa</span>
                        </div>
                    </v-col>
                </div>
            </v-card-text>
        </v-card>

        <v-card style="width: 100%;">
            <v-card-text>
                <h3>Taxon browser</h3>

                <v-data-table-server
                    :headers="headers"
                    :items="taxa"
                    :items-length="taxaLength"
                    :items-per-page="5"
                    :loading="taxaLoading"
                    :search="filterValue"
                    density="compact"
                    @update:options="loadTaxa"
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
                    <template #item.rank="{ item }">
                        <div class="d-flex align-center">
                            <div
                                style="height: 10px; width: 10px; border-radius: 50%;"
                                :class="`mr-2 bg-${getRankColor(item.rank)}`"
                            />
                            <div>{{ item.rank }}</div>
                        </div>
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
                    enter a keyword to search for taxa. You can search by name, NCBI identifier or rank.
                </div>
            </v-card-text>
        </v-card>

    </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import UniprotCommunicator from "@/logic/communicators/uniprot/UniprotCommunicator";
import useAsync from "@/composables/useAsync";
import {NcbiTaxon, NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
import NcbiResponseCommunicator from "@/logic/communicators/unipept/taxonomic/NcbiResponseCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import useNcbiOntology from "@/composables/ontology/useNcbiOntology";

// TODO remove any type whenever Vuetify 3 exposes the DataTableHeader type
const headers: any = [
    {
        title: "NCBI ID",
        align: "start",
        value: "id",
        width: "15%",
        sortable: true
    },
    {
        title: "Name",
        align: "start",
        value: "name",
        width: "40%",
        sortable: true
    },
    {
        title: "Rank Name",
        align: "start",
        value: "rank",
        width: "30%",
        sortable: true
    },
    {
        title: "",
        align: "left",
        value: "action",
        width: "15%",
        sortable: false
    }
];

const rankColors: string[] = [
    "red",
    "red-darken-4",
    "pink",
    "pink-darken-4",
    "purple",
    "purple-darken-4",
    "deep-purple",
    "deep-purple-darken-4",
    "indigo",
    "indigo-darken-4",
    "blue",
    "blue-darken-4",
    "light-blue",
    "light-blue-darken-4",
    "cyan",
    "cyan-darken-4",
    "teal",
    "teal-darken-4",
    "green",
    "green-darken-4",
    "light-green",
    "light-green-darken 4",
    "lime-darken-1",
    "lime-darken-4",
    "amber",
    "amber-darken-4",
    "orange",
    "orange-darken-4",
    "deep-orange",
    "deep-orange-darken-4"
];


// Values that define UI behaviour of the component
const selectedItems = defineModel<NcbiTaxon[]>({default: []});

const selectItem = (item: NcbiTaxon) => {
    const idx = selectedItems.value.findIndex(element => element.id === item.id);
    if (idx === -1) {
        selectedItems.value.push(item)
    } else {
        selectedItems.value.splice(idx, 1);
    }
    selectedItems.value = [ ...selectedItems.value ];
}

const clearSelection = () => selectedItems.value = [];

const itemSelected = (item: NcbiTaxon) => selectedItems.value.some(i => i.id === item.id);

const getRankColor = (rank: string): string => {
    const idx = Object.values(NcbiRank).findIndex(r => r === rank);
    return rankColors[idx % rankColors.length];
}


// Logic for loading taxa and showing them in the browser table
interface LoadItemsParams {
    page: number;
    itemsPerPage: number;
    sortBy: { key: string, order: "asc" | "desc" }[];
}

const taxaLoading = ref<boolean>(true);
const taxa = ref<NcbiTaxon[]>([]);
const taxaLength = ref<number>(0);

// value that's used to filter the names of taxa by
const filterValue = ref("");

const ncbiCommunicator = new NcbiResponseCommunicator(DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE);
const { ontology: ncbiOntology, update: updateNcbiOntology } = useNcbiOntology();

const loadTaxa = async function({ page, itemsPerPage, sortBy }: LoadItemsParams) {
    taxaLoading.value = true;
    // How many taxa satisfy the given requirements?
    taxaLength.value = await ncbiCommunicator.getNcbiCount(filterValue.value);

    // Retrieve the IDs of the taxa that are present in the given range.
    let sortByColumn: "id" | "name" | "rank" | undefined = undefined;
    let sortDesc = false;
    if (sortBy && sortBy.length > 0) {
        sortByColumn = sortBy[0].key.toLowerCase() as ("id" | "name" | "rank" | undefined);
        sortDesc = sortBy[0].order === "desc";
    }
    const taxaIdsInRange = await ncbiCommunicator.getNcbiRange(
        (page - 1) * itemsPerPage,
        page * itemsPerPage,
        filterValue.value,
        sortByColumn,
        sortDesc
    );

    // Update the NCBI ontology such that the name (and other properties) of these taxa are actually available.
    await updateNcbiOntology(taxaIdsInRange, false);
    // Finally, show all these selected taxa in the data table
    taxa.value = [];
    for (const selectedTaxon of taxaIdsInRange) {
        taxa.value.push(ncbiOntology.get(selectedTaxon)!);
    }
    taxaLoading.value = false;
}

const clearSearch = () => filterValue.value = "";

// Logic responsible for computing the amount of UniProt proteins associated with the selected taxa
const { isExecuting, performIfLast } = useAsync<number>();

const uniprotRecordCount = ref(0);
const formattedUniprotRecordsCount = computed(() =>
    uniprotRecordCount.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
);

const computeUniprotRecordsCount = () => {
    performIfLast(
        () => UniprotCommunicator.getRecordCount(
            selectedItems.value.map(taxon => taxon.id)
        ),
        (count) => {
            uniprotRecordCount.value = count;
        }
    );
};

const taxaCount = ref(0);
const formattedTaxaCount = computed(() =>
    taxaCount.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
);

const computeTaxaCount = () => {
    performIfLast(

    )
}

watch(selectedItems, () => {
    computeUniprotRecordsCount();
});

onMounted(() => {
    computeUniprotRecordsCount();
});
</script>

<style scoped>
.settings-text {
    font-size: 14px;
    color: rgba(0,0,0,.6);
}
</style>
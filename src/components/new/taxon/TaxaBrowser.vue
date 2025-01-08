<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="mb-4">
<!--                    <v-alert-->
<!--                        title="Taxa selected for filtering"-->
<!--                        text="Only UniProtKB-records that are associated with a selected organism or one of its children will be retained in the resulting database."-->
<!--                        type="info"-->
<!--                        variant="tonal"-->
<!--                    />-->

                    <div>
                        <v-container>
                            <v-row>
                                <div style="width: 100%;">
                                    <div class="d-flex align-center">
                                        <div v-if="selectedItems.length === 0" style="text-align: center; width: 100%;">
                                            <div>No taxa selected yet. No filtering will be applied.</div>
                                            <div class="text-caption">
                                                Use the table and search bar below to find taxa that can be used for filtering.
                                            </div>
                                        </div>
                                        <v-chip-group v-else column class="flex-grow-1">
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
                                        <v-tooltip v-if="selectedItems.length > 0" location="bottom" open-delay="500">
                                            <template #activator="{ props }">
                                                <v-btn
                                                    v-bind="props"
                                                    class="align-self-center"
                                                    variant="outlined"
                                                    color="error"
                                                    @click="clearSelection"
                                                >
                                                    Clear all
                                                </v-btn>
                                            </template>
                                            <span>Clear selection</span>
                                        </v-tooltip>
                                    </div>
                                    <v-divider></v-divider>
                                </div>
                            </v-row>
                            <v-row>
                                <div class="mt-1">
                                    <span v-if="isExecuting">Computing protein count...</span>
                                    <span v-else>
                                        <b>{{ formattedUniprotRecordsCount }}</b> UniProtKB records are associated with this filter settings.
                                    </span>
                                </div>
                            </v-row>
                        </v-container>
                    </div>
                </div>

                <div>
                    <v-data-table-server
                        :headers="headers"
                        :items="taxa"
                        :items-length="taxaLength"
                        :items-per-page="5"
                        :loading="taxaLoading"
                        :search="filterValue"
                        @update:options="loadTaxa"
                        density="compact"
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
                    enter a keyword to search for taxa. You can search by name, NCBI identifier or rank.
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import UniprotCommunicator from "@/logic/communicators/uniprot/UniprotCommunicator";
import useAsync from "@/composables/new/useAsync";
import NcbiTaxon, {NcbiRank} from "@/logic/new/ontology/taxonomic/Ncbi";
import NcbiResponseCommunicator from "@/logic/communicators/unipept/taxonomic/NcbiResponseCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/new/Constants";
import useNcbiOntology from "@/composables/new/ontology/useNcbiOntology";

const headers = [
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
        width: "45%",
        sortable: true
    },
    {
        title: "Rank Name",
        align: "start",
        value: "rank",
        width: "38%",
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
const selectedItems = defineModel<NcbiTaxon[]>({ default: [] });

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
    let sortDesc: boolean = false;
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
        taxa.value.push(ncbiOntology.value.get(selectedTaxon)!);
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

watch(selectedItems, () => {
    computeUniprotRecordsCount();
});

onMounted(() => {
    computeUniprotRecordsCount();
});
</script>

<style scoped>
.inline-code {
    background-color: #eee;
    font-family: Roboto mono, monospace;
    padding: 0 4px;
}
</style>
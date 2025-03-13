<template>
    <div>
        <v-card style="width: 100%;" class="mb-2">
            <v-card-text>
                <h3 class="mb-2">Database summary</h3>

                <div class="d-flex">
                    <v-col cols="8" :class="invalidReferenceProteomes.length !== 0 ? 'pt-0' : ''">
                        <v-alert
                            v-if="invalidReferenceProteomes.length !== 0"
                            class="mb-2"
                            type="error"
                            variant="outlined"
                            :text="`Some reference proteomes from the file you've uploaded are invalid: ${invalidReferenceProteomes.join(', ')}. Please check and correct any mistakes.`"
                        />
                        <h4>Selected reference proteomes</h4>
                        <div class="text-caption">
                            This is a summary of all reference proteomes that have been selected for inclusion in your database.
                            Proteins from UniProtKB that are associated to any of these reference proteomes will be included in the final database.
                        </div>
                        <div class="d-flex mt-4">
                            <div
                                v-if="selectedItems.length === 0"
                                class="settings-text flex-grow-1"
                            >
                                No proteomes selected yet. Please select reference proteomes from the table below.
                            </div>
                            <v-chip-group
                                v-else
                                class="flex-grow-1 d-flex"
                                column
                            >
                                <v-chip
                                    v-for="proteome in selectedItems"
                                    :key="proteome.id"
                                    :class="`bg-primary`"
                                    closable
                                    variant="flat"
                                    @click:close="selectItem(proteome)"
                                >
                                    {{ proteome.id }}
                                </v-chip>
                            </v-chip-group>
                            <v-tooltip
                                location="bottom"
                                open-delay="500"
                            >
                                <template #activator="{ props }">
                                    <file-upload-button
                                        v-bind="props"
                                        class="mr-2"
                                        style="align-self: start;"
                                        color="primary"
                                        :loading="processingUploadedProteomes"
                                        @upload="uploadReferenceProteomesFromFile"
                                        prepend-icon="mdi-file-upload"
                                    >
                                        Upload from file
                                    </file-upload-button>
                                </template>
                                <span>Select reference proteomes from a file containing proteome IDs (one per line).</span>
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
                            <span>~ {{ formattedUniprotRecordsCount }} proteins</span>
                        </div>
                        <div class="d-flex align-center">
                            <v-icon class="mr-2">mdi-bacteria</v-icon>
                            <span>{{ formattedTaxaCount }} different taxa</span>
                        </div>
                    </v-col>
                </div>
            </v-card-text>
        </v-card>

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
// TODO remove any type whenever Vuetify 3 exposes the DataTableHeader type
import ReferenceProteome from "@/logic/ontology/proteomes/ReferenceProteome";
import {computed, onMounted, ref, watch} from "vue";
import ProteomeCommunicator from "@/logic/communicators/unipept/proteome/ProteomeCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import useProteomeOntology from "@/composables/ontology/useProteomeOntology";
import UniprotCommunicator from "@/logic/communicators/uniprot/UniprotCommunicator";
import FileUploadButton from "@/components/filesystem/FileUploadButton.vue";

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

// Uploading and processing reference proteomes from file
const invalidReferenceProteomes = ref<string[]>([]);

const processingUploadedProteomes = ref<boolean>(false);

const uploadReferenceProteomesFromFile = async (file: File) => {
    processingUploadedProteomes.value = true;
    invalidReferenceProteomes.value = [];

    const proteomes = await file.text().then(t => t.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0));

    const { ontology: proteomeOntology, update: updateProteomeOntology } = useProteomeOntology();

    await updateProteomeOntology(proteomes);

    for (const proteome of proteomes) {
        if (proteomeOntology.has(proteome)) {
            if (!selectedItems.value.some(item => item.id === proteome)) {
                selectedItems.value.push(proteomeOntology.get(proteome)!);
            }
        } else {
            invalidReferenceProteomes.value.push(proteome);
        }
    }

    processingUploadedProteomes.value = false;
}

// Counting of proteins and taxa
const uniprotRecordCount = ref(0);
const formattedUniprotRecordsCount = computed(() =>
    uniprotRecordCount.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
);

const computeUniprotRecordsCount = () => {
    uniprotRecordCount.value = selectedItems.value.reduce((acc, proteome) => acc + proteome.proteinCount, 0);
};

const taxaCount = ref(0);
const formattedTaxaCount = computed(() =>
    taxaCount.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
)

const computeTaxaCount = () => {
    taxaCount.value = new Set(selectedItems.value.map(proteome => proteome.taxonId)).size;
}

watch(selectedItems, () => {
    computeUniprotRecordsCount();
    computeTaxaCount()
});

onMounted(() => {
    computeUniprotRecordsCount();
    computeTaxaCount()
});
</script>

<style scoped>
.settings-text {
    font-size: 14px;
    color: rgba(0,0,0,.6);
}
</style>
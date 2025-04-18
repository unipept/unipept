<template>
    <div>
        <database-summary
            title="Selected taxa"
            description="This is a summary of all taxa that have been selected for inclusion in your database. Proteins from UniProtKB that are associated to any of these taxa, or their descendants will be included in the final database. If no taxa are selected here, the final database will contain all UniProtKB proteins (TrEMBL + SwissProt)."
            empty-placeholder="No taxa selected yet. No filtering will be applied. Select taxa from the table below."
            v-model:selected-items="selectedItems"
            v-model:invalid-items="invalidItems"
            :compute-protein-count="computeProteinCount"
            :compute-taxon-count="computeTaxonCount"
            :chip-background-color="getRankColor"
            :chip-variant="getRankState"
            :item-display-name="(taxon: NcbiTaxon) => taxon.name"
            @upload-file="processUploadedTaxa"
            class="mb-2"
        />

        <v-unipept-card style="width: 100%;">
            <v-card-text>
                <h3>Taxon browser</h3>

                <v-data-table-server
                    :headers="headers"
                    :items="taxa"
                    :items-length="taxaLength"
                    :items-per-page="5"
                    :loading="taxaLoading"
                    :search="debouncedFilterValue"
                    density="compact"
                    color="primary"
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
                                :class="`mr-2 bg-${getRankColor(item)}`"
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

                        <v-tooltip
                            v-else-if="ancestorSelected(item)"
                            text="This taxon is already included because of an ancestor"
                        >
                            <template #activator="{ props }">
                                <div v-bind="props" class="d-inline-block">
                                    <v-btn
                                        color="primary"
                                        density="compact"
                                        variant="text"
                                        prepend-icon="mdi-plus"
                                        disabled
                                    >
                                        Select
                                    </v-btn>
                                </div>
                            </template>
                        </v-tooltip>

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
        </v-unipept-card>

    </div>
</template>

<script setup lang="ts">
import UniprotCommunicator from "@/logic/communicators/uniprot/UniprotCommunicator";
import {NcbiTaxon, NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
import NcbiResponseCommunicator from "@/logic/communicators/unipept/taxonomic/NcbiResponseCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import useNcbiOntology from "@/composables/ontology/useNcbiOntology";
import DatabaseSummary from "@/components/browsers/DatabaseSummary.vue";
import useDatabaseSummary from "@/components/browsers/useDatabaseSummary";
import useBrowserLoader, {LoadItemsParams} from "@/components/browsers/useBrowserLoader";
import TaxonomyResponseCommunicator from "@/logic/communicators/unipept/taxonomic/TaxonomyResponseCommunicator";
import {refDebounced} from "@vueuse/core";

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
    "light-green-darken-4",
    "lime-darken-1",
    "lime-darken-4",
    "amber",
    "amber-darken-4",
    "orange",
    "orange-darken-4",
    "deep-orange",
    "deep-orange-darken-4"
];

// Commonly reused logic and values extracted from composable
const selectedItems = defineModel<NcbiTaxon[]>({default: []});

const {
    uploadFile: uploadTaxonFile,
    invalidItems,
    selectItem,
    clearSelection,
    itemSelected
} = useDatabaseSummary<number, NcbiTaxon>(selectedItems);

const {ontology: ncbiOntology, update: updateNcbiOntology} = useNcbiOntology();

const ancestorSelected = (taxon: NcbiTaxon) => {
    return selectedItems.value.some((selected: NcbiTaxon) => taxon.id != selected.id && taxon.lineage.includes(selected.id));
};

// Start of logic that handles presentation and UI of the component
/**
 * Determines the color of a taxon based by its rank. Taxa with equal ranks have equal colors.
 *
 * @param taxon taxon node for which the color needs to be determined.
 */
const getRankColor = (taxon: NcbiTaxon): string => {
    const idx = Object.values(NcbiRank).findIndex(r => r === taxon.rank);
    return rankColors[idx % rankColors.length];
}

const getRankState = (taxon: NcbiTaxon): 'flat' | 'plain' => {
    if (ancestorSelected(taxon)) {
        return "plain";
    }
    return "flat";
}

// Start of logic for processing the uploaded taxon file
const processUploadedTaxa = async (file: File, callback: () => void) => {
    await uploadTaxonFile(
        file,
        ncbiOntology,
        updateNcbiOntology,
        async (ids: string[]) => {
            // A provided taxon ID is valid if the string is an integer, and is known by the NCBI taxonomy.
            const validIds: number[] = [];
            const invalidIds: string[] = [];

            // First check if the ID is a valid integer.
            const parsedIds: number[] = []
            for (const id of ids) {
                const parsedId = parseInt(id);
                if (isNaN(parsedId)) {
                    invalidIds.push(id);
                } else {
                    parsedIds.push(parsedId);
                }
            }

            // Then check if the ID represents a valid NCBI identifier.
            await updateNcbiOntology(parsedIds, false);

            for (const parsedId of parsedIds) {
                if (ncbiOntology.has(parsedId)) {
                    validIds.push(parsedId);
                } else {
                    invalidIds.push(parsedId.toString());
                }
            }

            return [validIds, invalidIds];
        }
    );

    // File has been processed, inform component that we're done
    callback();
}

// Logic for loading taxa and showing them in the browser table
const {
    loading: taxaLoading,
    items: taxa,
    itemsLength: taxaLength,
    load: loadTaxaForBrowser,
    filterValue,
    clearSearch
} = useBrowserLoader<number, NcbiTaxon>();

const debouncedFilterValue = refDebounced(filterValue, 600);

const ncbiCommunicator = new NcbiResponseCommunicator(DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE);
const taxonomyCommunicator = new TaxonomyResponseCommunicator(DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE);

const loadTaxa = async (params: LoadItemsParams) => {
    await loadTaxaForBrowser(
        params,
        updateNcbiOntology,
        ncbiOntology,
        (start: number, end: number, filter?: string, sortByColumn?: string, sortDesc?: boolean) => ncbiCommunicator.getNcbiRange(start, end, filter, sortByColumn as any, sortDesc),
        (filter) => ncbiCommunicator.getNcbiCount(filter)
    )
};

// Logic responsible for computing the amount of UniProt proteins associated with the selected taxa
const computeProteinCount = async () => {
    return await UniprotCommunicator.getRecordCount(
        selectedItems.value.map(taxon => taxon.id)
    );
};

const computeTaxonCount = async () => {
    const items = selectedItems.value.filter(taxon => !ancestorSelected(taxon));
    const taxonomies = await taxonomyCommunicator.getResponses(items.map(taxon => taxon.id));
    return taxonomies.reduce((acc, taxonomy) => acc + taxonomy.descendants.length, 0);
};
</script>

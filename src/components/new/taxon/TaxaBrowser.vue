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
                                    <span v-if="isExecuting">Computing database size...</span>
                                    <span v-else>
                                        Resulting database will contain <b>{{ formattedUniprotRecordsCount }}</b> UniProtKB records.
                                    </span>
                                </div>
                            </v-row>
                        </v-container>
                    </div>
                </div>

                <div>
                    <v-data-table
                        :headers="headers"
                        :items="taxa"
                        :items-per-page="5"
                        :server-items-length="0"
                        :loading="loading"
                        density="compact"
                    >
                        <template #footer.prepend>
                            <v-text-field
                                v-model="search"
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
                    </v-data-table>
                </div>

                <div class="text-caption mb-2">
                    <span>Hint:</span>
                    enter a keyword to search for taxa. You can search by name, NCBI identifier or rank.
                    <v-tooltip location="bottom" open-delay="500">
                        <template #activator="{ props }">
                            <a class="text-primary cursor-pointer" v-bind="props" @click="searchHintsToggled = !searchHintsToggled">
                                Advanced search capabilities
                            </a>
                        </template>
                        <span>Click to toggle search hints.</span>
                    </v-tooltip>
                    are available.
                </div>

                <div v-if="searchHintsToggled" class="text-caption">
                    Some examples of what you can do:
                    <ul>
                        <li class="text-caption">
                            Look for all taxa with a specific rank:
                            <span class="inline-code">rank_name:(species)</span>
                        </li>
                        <li class="text-caption">
                            Look for all taxa whose name contains the words "severe" and "acute":
                            <span class="inline-code">name:(severe acute)</span>
                        </li>
                        <li class="text-caption">
                            Look for all taxa that are assigned the "species" rank and whose name contains "bacteria":
                            <span class="inline-code">rank_name:(species) AND name:(bacteria)</span>
                        </li>
                        <li class="text-caption">
                            Look for all taxa whose ID starts with "1234" or whose name contains "1234":
                            <span class="inline-code">id:(^1234*) OR name:(1234)</span>
                        </li>
                        <li class="text-caption">
                            Look for all "Escherichia Coli" by using it's abbreviation:
                            <span class="inline-code">e* coli</span>
                        </li>
                    </ul>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import UniprotCommunicator from "@/logic/communicators/uniprot/UniprotCommunicator";
import useAsync from "@/composables/new/useAsync";
import {NcbiRank, NcbiResponseCommunicator, NcbiTaxon} from "unipept-web-components";
import useNcbiOntology from "@/composables/new/ontology/useNcbiOntology";

const headers = [
    {
        title: "NCBI ID",
        align: "start",
        value: "id",
        width: "15%"
    },
    {
        title: "Name",
        align: "start",
        value: "name",
        width: "45%"
    },
    {
        title: "Rank Name",
        align: "start",
        value: "rank",
        width: "38%"
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

const selectedItems = defineModel<NcbiTaxon[]>({ default: [] });

const { isExecuting, performIfLast } = useAsync<number>();

const loading = ref<boolean>(false);

const taxa = ref<NcbiTaxon[]>([
    new NcbiTaxon(2, "Bacteria", "superkingdom", []),
    new NcbiTaxon(6, "Azorhizobium", "genus", []),
    new NcbiTaxon(7, "Azorhizobium caulinodans", "species", []),
]);
const search = ref("");

const searchHintsToggled = ref(false);

const uniprotRecordCount = ref(0);
const formattedUniprotRecordsCount = computed(() =>
    uniprotRecordCount.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
);

const selectItem = (item: NcbiTaxon) => {
    const idx = selectedItems.value.findIndex(element => element.id === item.id);
    if (idx === -1) {
        selectedItems.value.push(item)
    } else {
        selectedItems.value.splice(idx, 1);
    }
    selectedItems.value = [ ...selectedItems.value ];
    computeUniprotRecordsCount();
}

const clearSelection = () => selectedItems.value = [];

const itemSelected = (item: NcbiTaxon) => selectedItems.value.some(i => i.id === item.id)

const clearSearch = () => search.value = "";

const getRankColor = (rank: string): string => {
    const idx = Object.values(NcbiRank).findIndex(r => r === rank);
    return rankColors[idx % rankColors.length];
}

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

onMounted(() => {
    // Retrieve first taxon items
    const ncbiCommunicator = new NcbiResponseCommunicator();

    // Compute amount of proteins associated with these taxa
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
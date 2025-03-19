<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="1800px"
    >
        <v-card>
            <v-card-title class="d-flex align-center">
                <h2>Create custom database</h2>
                <v-spacer />
                <v-btn
                    icon
                    flat
                    @click="dialogOpen = false"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0">
                <v-stepper-vertical
                    color="primary"
                    flat
                >
                    <template #default="{ step, next, prev }">
                        <v-stepper-vertical-item
                            :complete="step as number > 1"
                            :editable="step as number > 1"
                            title="Database name"
                            value="1"
                        >
                            <v-form v-model="isValidDatabaseName">
                                <v-container fluid>
                                    <v-row>
                                        <v-col cols="12">
                                            <div>
                                                <v-text-field
                                                    v-model="databaseName"
                                                    density="comfortable"
                                                    variant="outlined"
                                                    label="Database name"
                                                    hint="Give your database a name to easily recognize it."
                                                    persistent-hint
                                                    :rules="[
                                                        v => !!v || 'Provide a valid name for your database',
                                                        v => !customFilterStore.hasFilter(v) || 'A filter with this name already exists'
                                                    ]"
                                                />
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-form>

                            <template #next>
                                <v-btn
                                    color="primary"
                                    text="Continue"
                                    :disabled="!isValidDatabaseName"
                                    @click="next"
                                />
                            </template>

                            <template #prev />
                        </v-stepper-vertical-item>

                        <v-stepper-vertical-item
                            :complete="step as number > 2"
                            :editable="isValidDatabaseName"
                            title="Construction method"
                            subtitle="Please select how you want to construct the database"
                            value="2"
                        >
                            <v-container fluid>
                                <v-row>
                                    <v-col cols="4">
                                        <span>
                                            Provide a list of <b>NCBI taxa</b> that should be used as the
                                            basis for a custom protein reference database. All available UniProt sources
                                            (both TrEMBL and SwissProt) will be consulted in this case.
                                        </span>
                                    </v-col>

                                    <v-col cols="4">
                                        <span>
                                            Provide a list of <b>UniProtKB reference proteomes</b> that should be used as the
                                            basis for a custom protein reference database. All available UniProt sources
                                            (both TrEMBL and SwissProt) will be consulted in this case.
                                        </span>
                                    </v-col>

                                    <v-col cols="4">
                                        <span>
                                            Provide a list of <b>UniProtKB proteins</b> that should be used as the
                                            basis for a custom protein reference database. All available UniProt sources
                                            (both TrEMBL and SwissProt) will be consulted in this case.
                                        </span>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="4" class="d-flex flex-column">
                                        <v-btn
                                            color="primary"
                                            text="By taxa"
                                            variant="tonal"
                                            @click="() => { filterSelection = FilterSelection.Manually; next(); }"
                                        />
                                    </v-col>

                                    <v-col cols="4" class="d-flex flex-column">
                                        <v-btn
                                            color="primary"
                                            text="By reference proteomes"
                                            variant="tonal"
                                            @click="() => { filterSelection = FilterSelection.ReferenceProteomes; next(); }"
                                        />
                                    </v-col>

                                    <v-col cols="4" class="d-flex flex-column">
                                        <v-btn
                                            color="primary"
                                            text="By proteins"
                                            variant="tonal"
                                            @click="() => { filterSelection = FilterSelection.Proteins; next(); }"
                                        />
                                    </v-col>
                                </v-row>
                            </v-container>

                            <template #actions />
                        </v-stepper-vertical-item>

                        <v-stepper-vertical-item
                            v-if="filterSelection === FilterSelection.None"
                            :complete="step as number > 3"
                            title="Select a construction method first"
                            value="3"
                        />

                        <v-stepper-vertical-item
                            v-else-if="filterSelection === FilterSelection.Manually"
                            :complete="step as number > 3"
                            editable
                            title="Filter organisms"
                            subtitle="Select which organisms will be present in the output database"
                            value="3"
                            class="pa-0"
                        >
                            <taxa-browser v-model="selectedTaxa" class="mb-4" />

                            <template #prev>
                                <v-btn 
                                    color="primary" 
                                    variant="tonal" 
                                    text="Build database" 
                                    @click="buildTaxonDatabase" 
                                />
                            </template>

                            <template #next>
                                <v-btn
                                    color="primary"
                                    variant="text"
                                    text="Go back"
                                    @click="prev"
                                />
                            </template>
                        </v-stepper-vertical-item>

                        <v-stepper-vertical-item
                            v-else-if="filterSelection === FilterSelection.ReferenceProteomes"
                            :complete="step as number > 3"
                            editable
                            title="Select reference proteomes"
                            subtitle="Decide on a set of reference proteomes that should be present in the database"
                            value="3"
                        >
                            <reference-proteome-browser v-model="selectedProteomes" class="mb-4" />

                            <template #prev>
                                <v-btn
                                    color="primary"
                                    variant="tonal"
                                    text="Build database"
                                    @click="buildProteomeDatabase"
                                />
                            </template>

                            <template #next>
                                <v-btn
                                    color="primary"
                                    variant="text"
                                    text="Go back"
                                    @click="prev"
                                />
                            </template>
                        </v-stepper-vertical-item>

                        <v-stepper-vertical-item
                            v-else
                            :complete="step as number > 3"
                            editable
                            title="Select UniProtKB proteins"
                            subtitle="Decide on a set of proteins that should be present in the database"
                            value="3"
                        >
                            <protein-browser v-model="selectedProteins" class="mb-4" />

                            <template #prev>
                                <v-btn
                                    color="primary"
                                    variant="tonal"
                                    text="Build database"
                                    @click="buildProteinDatabase"
                                />
                            </template>

                            <template #next>
                                <v-btn
                                    color="primary"
                                    variant="text"
                                    text="Go back"
                                    @click="prev"
                                />
                            </template>
                        </v-stepper-vertical-item>
                    </template>
                </v-stepper-vertical>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import TaxaBrowser from "@/components/browsers/TaxaBrowser.vue";
import {NcbiTaxon} from "@/logic/ontology/taxonomic/Ncbi";
import useCustomFilterStore, {Filter, FilterType} from "@/store/new/CustomFilterStore";
import ReferenceProteomeBrowser from "@/components/browsers/ReferenceProteomeBrowser.vue";
import ProteinBrowser from "@/components/browsers/ProteinBrowser.vue";

const customFilterStore = useCustomFilterStore();

const dialogOpen = defineModel<boolean>();

const emits = defineEmits<{
    (e: 'create', name: string, filter: Filter): void,
}>();

const databaseName = ref<string>("");
const isValidDatabaseName = ref(false);
const filterSelection = ref<FilterSelection>(FilterSelection.None);

const selectedTaxa = ref<NcbiTaxon[]>([]);
const selectedProteomes = ref<any[]>([]);
const selectedProteins = ref<any[]>([]);

const buildTaxonDatabase = () => {
    emits("create", databaseName.value, {
        filter: FilterType.Taxon,
        data: selectedTaxa.value.map(taxon => taxon.id)
    });
    dialogOpen.value = false;
};

const buildProteomeDatabase = () => {
    emits("create", databaseName.value, {
        filter: FilterType.Proteome,
        data: selectedProteomes.value.map(proteome => proteome.id)
    });
    dialogOpen.value = false;
};

const buildProteinDatabase = () => {
    emits("create", databaseName.value, {
        filter: FilterType.Protein,
        data: selectedProteins.value.map(protein => protein.protein)
    });
    dialogOpen.value = false;
};

const resetDialog = () => {
    databaseName.value = "";
    isValidDatabaseName.value = false;
    filterSelection.value = FilterSelection.None;
    selectedTaxa.value = [];
    selectedProteomes.value = [];
    selectedProteins.value = [];
}

watch(dialogOpen, () => {
    if (!dialogOpen.value) {
        resetDialog();
    }
})
</script>

<script lang="ts">
enum FilterSelection {
    None,
    Manually,
    ReferenceProteomes,
    Proteins
}
</script>

<style scoped>
:deep(.v-stepper-vertical-actions.v-stepper-actions) {
    padding-top: 0;
}
</style>
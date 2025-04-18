<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="1800px"
    >
        <v-unipept-card class="bg-mainBody">
            <v-card-title class="d-flex align-center">
                <h2>Update custom database</h2>
                <v-spacer />
                <v-btn
                    color="transparent"
                    icon
                    flat
                    @click="dialogOpen = false"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text>
                <v-form v-model="isValidDatabaseName">
                    <v-row>
                        <v-col cols="12">
                            <div>
                                <v-text-field
                                    v-model="databaseName"
                                    class="mb-3"
                                    density="comfortable"
                                    variant="outlined"
                                    label="Database name"
                                    persistent-hint
                                    :rules="[
                                        v => !!v || 'Provide a valid name for your database',
                                        v => (!customFilterStore.hasFilter(v) || name === v) || 'A filter with this name already exists'
                                    ]"
                                />
                            </div>
                        </v-col>
                    </v-row>
                </v-form>

                <div
                    v-if="filterSelection === FilterSelection.Manually"
                    class="pa-0"
                >
                    <taxa-browser v-model="selectedTaxa" class="mb-4" />

                    <v-btn
                        color="primary"
                        variant="text"
                        text="Cancel"
                        @click="dialogOpen = false"
                    />

                    <v-btn
                        color="primary"
                        variant="tonal"
                        text="Update database"
                        :disabled="!isValidDatabaseName"
                        @click="confirmDialogOpen = true"
                    />

                    <edit-database-dialog
                        v-model="confirmDialogOpen"
                        :database="name"
                        @confirm="updateTaxonDatabase"
                    />
                </div>

                <div v-else-if="filterSelection === FilterSelection.ReferenceProteomes">
                    <reference-proteome-browser v-model="selectedProteomes" class="mb-4" />

                    <v-btn
                        color="primary"
                        variant="text"
                        text="Cancel"
                        @click="dialogOpen = false"
                    />

                    <v-btn
                        color="primary"
                        variant="tonal"
                        text="Update database"
                        :disabled="!isValidDatabaseName"
                        @click="confirmDialogOpen = true"
                    />

                    <edit-database-dialog
                        v-model="confirmDialogOpen"
                        :database="name"
                        @confirm="updateProteomeDatabase"
                    />
                </div>

                <div v-else>
                    <protein-browser v-model="selectedProteins" class="mb-4" />

                    <v-btn
                        color="primary"
                        variant="text"
                        text="Cancel"
                        @click="dialogOpen = false"
                    />

                    <v-btn
                        color="primary"
                        variant="tonal"
                        text="Update database"
                        :disabled="!isValidDatabaseName"
                        @click="confirmDialogOpen = true"
                    />

                    <edit-database-dialog
                        v-model="confirmDialogOpen"
                        :database="name"
                        @confirm="updateProteinDatabase"
                    />
                </div>
            </v-card-text>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
import useCustomFilterStore, {Filter, FilterType} from "@/store/CustomFilterStore";
import {ref, watch} from "vue";
import {NcbiTaxon} from "@/logic/ontology/taxonomic/Ncbi";
import ReferenceProteome from "@/logic/ontology/proteomes/ReferenceProteome";
import Protein from "@/logic/ontology/proteins/Protein";
import ProteinBrowser from "@/components/browsers/ProteinBrowser.vue";
import ReferenceProteomeBrowser from "@/components/browsers/ReferenceProteomeBrowser.vue";
import TaxaBrowser from "@/components/browsers/TaxaBrowser.vue";
import useProteomeOntology from "@/composables/ontology/useProteomeOntology";
import useProteinOntology from "@/composables/ontology/useProteinOntology";
import useNcbiOntology from "@/composables/ontology/useNcbiOntology";
import EditDatabaseDialog from "@/components/database/EditDatabaseDialog.vue";

const { ontology: ncbiOntology, update: updateNcbiOntology } = useNcbiOntology();
const { ontology: proteinOntology, update: updateProteinOntology } = useProteinOntology();
const { ontology: proteomeOntology, update: updateProteomeOntology } = useProteomeOntology();
const customFilterStore = useCustomFilterStore();

const dialogOpen = defineModel<boolean>();

const props = defineProps<{
    name: string,
    filter: Filter | undefined,
}>();

const emits = defineEmits<{
    (e: 'edit', name: string, filter: Filter): void,
}>();

const confirmDialogOpen = ref(false);

const databaseName = ref<string>("");
const isValidDatabaseName = ref(false);
const filterSelection = ref<FilterSelection>(FilterSelection.None);

const selectedTaxa = ref<NcbiTaxon[]>([]);
const selectedProteomes = ref<ReferenceProteome[]>([]);
const selectedProteins = ref<Protein[]>([]);

const updateDatabase = (type: FilterType, data: number[] | string[]) => {
    emits("edit", databaseName.value, {
        filter: type,
        data: data
    });
    dialogOpen.value = false;
}

const updateTaxonDatabase = () => {
    updateDatabase(FilterType.Taxon, selectedTaxa.value.map(taxon => taxon.id));
};

const updateProteomeDatabase = () => {
    updateDatabase(FilterType.Proteome, selectedProteomes.value.map(proteome => proteome.id));
};

const updateProteinDatabase = () => {
    updateDatabase(FilterType.Protein, selectedProteins.value.map(protein => protein.id));
};

watch(dialogOpen, async () => {
    if (dialogOpen && props.filter) {
        selectedTaxa.value = [];
        selectedProteomes.value = [];
        selectedProteins.value = [];
        filterSelection.value = FilterSelection.None;

        databaseName.value = props.name;

        switch (props.filter.filter) {
            case FilterType.Taxon:
                filterSelection.value = FilterSelection.Manually;
                await updateNcbiOntology(props.filter.data);
                selectedTaxa.value = props.filter.data?.map(taxon => ncbiOntology.get(taxon)) || [];
                break;
            case FilterType.Protein:
                filterSelection.value = FilterSelection.Proteins;
                await updateProteinOntology(props.filter.data);
                selectedProteins.value = props.filter.data?.map(protein => proteinOntology.get(protein)) || [];
                break;
            case FilterType.Proteome:
                filterSelection.value = FilterSelection.ReferenceProteomes;
                await updateProteomeOntology(props.filter.data);
                selectedProteomes.value = props.filter.data?.map(proteome => proteomeOntology.get(proteome)) || [];
                break;
            case FilterType.UniProtKB:
            default:
                filterSelection.value = FilterSelection.None;
        }
    }
});
</script>

<script lang="ts">
export enum FilterSelection {
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


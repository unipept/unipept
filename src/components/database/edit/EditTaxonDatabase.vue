<template>
    <v-dialog
        v-model="dialogOpen"
        max-width="1800px"
        scrollable
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

            <v-card-text class="pb-1">
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
                                        v => (!customFilterStore.hasFilterByName(v) || filter.name === v) || 'A filter with this name already exists'
                                    ]"
                                />
                            </div>
                        </v-col>
                    </v-row>
                </v-form>

                <taxa-browser
                    v-model="selectedTaxa"
                />
            </v-card-text>

            <v-card-actions class="pa-5 pt-4 justify-start">
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
                    @click="confirmEdit"
                />

                <edit-database-dialog
                    v-model="confirmDialogOpen"
                    :database="database"
                    @confirm="updateDatabase"
                />
            </v-card-actions>
        </v-unipept-card>
    </v-dialog>
</template>

<script setup lang="ts">
import useCustomFilterStore, {Filter, FilterType} from "@/store/CustomFilterStore";
import {computed, onMounted, ref, watch} from "vue";
import {NcbiTaxon} from "@/logic/ontology/taxonomic/Ncbi";
import TaxaBrowser from "@/components/browsers/TaxaBrowser.vue";
import useNcbiOntology from "@/composables/ontology/useNcbiOntology";
import EditDatabaseDialog from "@/components/database/edit/EditDatabaseDialog.vue";
import useArrayCompare from "@/composables/useArrayCompare";

const { ontology: ncbiOntology, update: updateNcbiOntology } = useNcbiOntology();
const customFilterStore = useCustomFilterStore();
const { compareNumberOrStringArrays } = useArrayCompare();

const dialogOpen = defineModel<boolean>();

const props = defineProps<{
    database: string,
    amountOfLinkedSamples: number,
}>();

const emits = defineEmits<{
    (e: 'edit:name', filter: Filter): void
    (e: 'edit:filter', filter: Filter): void
}>();

const confirmDialogOpen = ref(false);

const databaseName = ref<string>("");
const isValidDatabaseName = ref(false);
const selectedTaxa = ref<NcbiTaxon[]>([]);

const filter = computed(() => ({ ...customFilterStore.getFilterById(props.database) }));

const confirmEdit = () => {
    // Ask the user for extra confirmation when the filter has been changed
    if (checkDirtyFilter()) {
        confirmDialogOpen.value = true;
        return;
    }

    // If only the name has changed, emit the name change directly
    if (databaseName.value !== filter.value.name) {
        emits('edit:name', {
            filter: FilterType.Taxon,
            name: databaseName.value,
            data: [ ...filter.value?.data ?? [] ].filter(d => d !== undefined).map(d => parseInt(d.toString())),
        });
    }

    dialogOpen.value = false;
}

const checkDirtyFilter = (): boolean => {
    const currentFilter = customFilterStore.getFilterById(props.database);

    if (!currentFilter || !currentFilter.data) {
        return true;
    }

    return !compareNumberOrStringArrays(currentFilter.data, selectedTaxa.value.map(taxon => taxon.id));
}

const updateDatabase = () => {
    dialogOpen.value = false;
    emits('edit:filter', {
        filter: FilterType.Taxon,
        name: databaseName.value,
        data: selectedTaxa.value.map(taxon => taxon.id),
    });
}

const initializeDialog = async () => {
    if (dialogOpen && filter.value) {
        databaseName.value = filter.value.name!;

        const taxonData = filter.value.data as number[];
        await updateNcbiOntology(taxonData);
        selectedTaxa.value = taxonData.map(taxon => ncbiOntology.get(taxon)).filter(t => t !== undefined) || [];
    }
}

watch(dialogOpen, initializeDialog);

onMounted(initializeDialog);
</script>

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

                <reference-proteome-browser
                    v-model="selectedProteomes"
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
import ReferenceProteome from "@/logic/ontology/proteomes/ReferenceProteome";
import ReferenceProteomeBrowser from "@/components/browsers/ReferenceProteomeBrowser.vue";
import useProteomeOntology from "@/composables/ontology/useProteomeOntology";
import EditDatabaseDialog from "@/components/database/edit/EditDatabaseDialog.vue";

const { ontology: proteomeOntology, update: updateProteomeOntology } = useProteomeOntology();
const customFilterStore = useCustomFilterStore();

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
const selectedProteomes = ref<ReferenceProteome[]>([]);

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
            filter: FilterType.Proteome,
            name: databaseName.value,
            data: [ ...filter.value?.data ?? [] ].filter(d => d !== undefined).map(d => d.toString()),
        });
    }

    dialogOpen.value = false;
}

const compareNumberOrStringArrays = (a: number[] | string[], b: number[] | string[]) => {
    if (a.length !== b.length) return false;

    const aSorted = a.slice().sort();
    const bSorted = b.slice().sort();

    return aSorted.every((value, index) => value === bSorted[index]);
}

const checkDirtyFilter = (): boolean => {
    const currentFilter = customFilterStore.getFilterById(props.database);

    if (!currentFilter || !currentFilter.data) {
        return true;
    }

    return !compareNumberOrStringArrays(currentFilter.data, selectedProteomes.value.map(proteome => proteome.id));
}

const updateDatabase = () => {
    dialogOpen.value = false;
    emits('edit:filter', {
        filter: FilterType.Proteome,
        name: databaseName.value,
        data: selectedProteomes.value.map(proteome => proteome.id),
    });
}

const initializeDialog = async () => {
    if (dialogOpen && filter.value) {
        databaseName.value = filter.value.name!;

        const proteomeData = filter.value.data as string[];
        await updateProteomeOntology(proteomeData);
        selectedProteomes.value = proteomeData.map(proteome => proteomeOntology.get(proteome)).filter(p => p !== undefined) || [];
    }
}

watch(dialogOpen, initializeDialog);

onMounted(initializeDialog);
</script>

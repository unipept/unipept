<template>
    <div>
        <v-unipept-card class="mb-6">
            <v-card-title class="text-h5 font-weight-bold">
                <v-icon icon="mdi-database" size="30" class="me-2" color="primary"/>
                Custom Databases
            </v-card-title>
            <v-card-text class="text-body-1">
                Below you can find a complete list of all custom databases that are currently registered to this
                project. To create a new custom database, press the button below the table. A wizard will guide you
                through the custom database construction process.
            </v-card-text>
        </v-unipept-card>

        <v-unipept-card>
            <v-data-table
                :headers="tableHeaders"
                :items="databases"
                :items-per-page="5"
                item-value="name"
                class="mt-0"
                density="compact"
            >
                <template #item.actions="{ item }">
                    <div class="d-flex align-center">
                        <v-icon
                            color="primary"
                            size="20"
                            class="me-2 cursor-pointer"
                            icon="mdi-pencil"
                            :disabled="item.type === 'N/A'"
                            @click.stop="editDatabase(item.name)"
                        />

                        <v-icon
                            color="primary"
                            size="20"
                            class="me-2 cursor-pointer"
                            icon="mdi-content-copy"
                            :disabled="item.type === 'N/A'"
                            @click.stop="duplicateDatabase(item.name)"
                        />

                        <v-icon
                            color="error"
                            size="20"
                            class="cursor-pointer"
                            icon="mdi-delete"
                            :disabled="item.type === 'N/A'"
                            @click.stop="deleteDatabase(item.name)"
                        />
                    </div>
                </template>
            </v-data-table>
        </v-unipept-card>

        <v-row justify="center" class="mt-6">
            <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-plus"
                text="New database"
                @click="createDatabase"
            />
        </v-row>

        <delete-database-dialog
            v-model="deleteDatabaseDialogOpen"
            :database="databaseToManipulate"
            @confirm="confirmDeleteDatabase(databaseToManipulate)"
        />

        <create-custom-database
            v-model="databaseDialogOpen"
            @create="confirmCreateDatabase"
        />

        <edit-custom-database
            v-model="editDatabaseDialogOpen"
            :name="databaseToManipulate"
            :filter="customFilterStore.getFilter(databaseToManipulate)"
            :amount-of-linked-samples="amountOfLinkedSamples"
            @edit="confirmEditDatabase"
        />
    </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import useCustomFilterStore, {Filter, FilterType} from "@/store/new/CustomFilterStore.js";
import TaxonomyResponseCommunicator from "@/logic/communicators/unipept/taxonomic/TaxonomyResponseCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import ProteinResponseCommunicator from "@/logic/communicators/unipept/protein/ProteinResponseCommunicator";
import UniprotCommunicator from "@/logic/communicators/uniprot/UniprotCommunicator";
import {useNumberFormatter} from "@/composables/useNumberFormatter";
import useProteinOntology from "@/composables/ontology/useProteinOntology";
import useProteomeOntology from "@/composables/ontology/useProteomeOntology";
import CreateCustomDatabase from "@/components/database/CreateCustomDatabase.vue";
import DeleteDatabaseDialog from "@/components/database/DeleteDatabaseDialog.vue";
import EditCustomDatabase from "@/components/database/EditCustomDatabase.vue";
import EditDatabaseDialog from "@/components/database/EditDatabaseDialog.vue";
import {GroupAnalysisStore} from "@/store/new/GroupAnalysisStore";

const { ontology: proteinOntology, update: updateProteinOntology } = useProteinOntology();
const { ontology: proteomeOntology, update: updateProteomeOntology } = useProteomeOntology();
const customFilterStore = useCustomFilterStore();
const { formatNumber } = useNumberFormatter();

const taxonomyCommunicator = new TaxonomyResponseCommunicator(DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE);
const proteinCommunicator = new ProteinResponseCommunicator(DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE);

const { project } = defineProps<{
    project: GroupAnalysisStore
}>();

const emits = defineEmits<{
    (e: 'database:update', name: string, newName: string, newFilter: Filter): void,
    (e: 'database:delete', name: string): void,
}>();

const databaseDialogOpen = ref(false);
const deleteDatabaseDialogOpen = ref(false);
const editDatabaseDialogOpen = ref(false);
const databaseToManipulate = ref<string>('');
const taxonCounts = ref<Map<string, string>>(new Map());
const proteinCounts = ref<Map<string, string>>(new Map());

const amountOfLinkedSamples = computed(() =>
    project.groups.reduce((acc, group) => {
        return acc + group.analyses.reduce((acc, analysis) => {
            if (analysis.config.database === databaseToManipulate.value) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }, 0)
);

const databases = computed(() => {
    return customFilterStore.filters.map(name => {
        const filter = customFilterStore.getFilter(name);
        return {
            name: name,
            type: showFilterType(filter.filter),
            taxaCount: taxonCounts.value.get(name) || 'computing...',
            proteinCount: proteinCounts.value.get(name) || 'computing...',
        };
    });
});

const showFilterType = (filterType: FilterType) => {
    switch (filterType) {
        case FilterType.UniProtKB:
            return 'N/A';
        case FilterType.Taxon:
            return 'Taxa';
        case FilterType.Protein:
            return 'Protein Accession Numbers';
        case FilterType.Proteome:
        default:
            return 'Reference Proteomes';
    }
};

const computeTaxonCount = async (filter: Filter) => {
    switch (filter.filter) {
        case FilterType.UniProtKB:
            const total = await taxonomyCommunicator.getResponses([ 1 ]);
            return total.reduce((acc, taxonomy) => acc + taxonomy.descendants.length, 0);
        case FilterType.Taxon:
            const taxonomies = await taxonomyCommunicator.getResponses(filter.data);
            return taxonomies.reduce((acc, taxonomy) => acc + taxonomy.descendants.length, 0);
        case FilterType.Protein:
            await updateProteinOntology(filter.data);
            return new Set<number>(filter.data?.map(p => proteinOntology.get(p)?.taxonId)).size
        case FilterType.Proteome:
        default:
            await updateProteomeOntology(filter.data);
            return new Set<number>(filter.data?.map(p => proteomeOntology.get(p)?.taxonId)).size
    }
};

const computeProteinCount = async (filter: Filter) => {
    switch (filter.filter) {
        case FilterType.UniProtKB:
            return await proteinCommunicator.getProteinCount();
        case FilterType.Taxon:
            return await UniprotCommunicator.getRecordCount(filter.data);
        case FilterType.Protein:
            return filter.data.length;
        case FilterType.Proteome:
        default:
            await updateProteomeOntology(filter.data);
            return filter.data.reduce((acc, proteome) => acc + proteomeOntology.get(proteome)?.proteinCount || 0, 0);
    }
};

const tableHeaders = [
    { title: 'Name', key: 'name' },
    { title: 'Type', key: 'type' },
    { title: '# Taxa', key: 'taxaCount' },
    { title: '# Proteins', key: 'proteinCount' },
    { title: 'Actions', key: 'actions', sortable: false },
];

const editDatabase = (name: string) => {
    databaseToManipulate.value = name;
    editDatabaseDialogOpen.value = true;
};

const confirmEditDatabase = async (name: string, filter: Filter) => {
    emits('database:update', databaseToManipulate.value, name, filter);

    const taxonCount = await computeTaxonCount(filter);
    const proteinCount = await computeProteinCount(filter);
    taxonCounts.value.set(name, `~ ${formatNumber(taxonCount)}`);
    proteinCounts.value.set(name, `~ ${formatNumber(proteinCount)}`);
};

const deleteDatabase = (name: string) => {
    databaseToManipulate.value = name;
    deleteDatabaseDialogOpen.value = true;
};

const confirmDeleteDatabase = (name: string) => {
    emits('database:delete', name);

    taxonCounts.value.delete(name);
    proteinCounts.value.delete(name);
    databaseToManipulate.value = '';
};

const duplicateDatabase = (name: string) => {
    let counter = 1;
    while (customFilterStore.filters.find(s => s === `${name} - copy ${counter}`)) {
        counter++;
    }

    const newName = `${name} - copy ${counter}`;
    const filter = customFilterStore.getFilter(name);
    customFilterStore.addFilter(newName, { ...filter });
    taxonCounts.value.set(newName, taxonCounts.value.get(name));
    proteinCounts.value.set(newName, proteinCounts.value.get(name));
};

const createDatabase = () => databaseDialogOpen.value = true;

const confirmCreateDatabase = async (name: string, filter: Filter) => {
    customFilterStore.addFilter(name, filter);
    const taxonCount = await computeTaxonCount(filter);
    const proteinCount = await computeProteinCount(filter);
    taxonCounts.value.set(name, `~ ${formatNumber(taxonCount)}`);
    proteinCounts.value.set(name, `~ ${formatNumber(proteinCount)}`);
}

const updateCounts = async () => {
    for (const filterName of customFilterStore.filters) {
        const filter = customFilterStore.getFilter(filterName);
        const taxonCount = await computeTaxonCount(filter);
        const proteinCount = await computeProteinCount(filter);
        taxonCounts.value.set(filterName, `~ ${formatNumber(taxonCount)}`);
        proteinCounts.value.set(filterName, `~ ${formatNumber(proteinCount)}`);
    }
}

onMounted(updateCounts);
</script>

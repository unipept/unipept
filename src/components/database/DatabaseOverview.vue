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
                    <div class="d-flex align-center justify-end">
                        <v-icon
                            color="primary"
                            size="20"
                            class="me-2 cursor-pointer"
                            icon="mdi-pencil"
                            :disabled="item.type === 'N/A'"
                            @click.stop="editDatabase(item.id)"
                        />

                        <v-icon
                            color="primary"
                            size="20"
                            class="me-2 cursor-pointer"
                            icon="mdi-content-copy"
                            :disabled="item.type === 'N/A'"
                            @click.stop="duplicateDatabase(item.id)"
                        />

                        <v-icon
                            color="error"
                            size="20"
                            class="cursor-pointer"
                            icon="mdi-delete"
                            :disabled="item.type === 'N/A'"
                            @click.stop="deleteDatabase(item.id)"
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
            @confirm="confirmDeleteDatabase"
        />

        <create-custom-database
            v-model="databaseDialogOpen"
            @create="confirmCreateDatabase"
        />

        <edit-custom-database
            v-model="editDatabaseDialogOpen"
            :database="databaseToManipulate"
            :amount-of-linked-samples="amountOfLinkedSamples"
            @edit="confirmEditDatabase"
        />
    </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import useCustomFilterStore, {Filter, FilterType} from "@/store/CustomFilterStore";
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
import {ProjectAnalysisStore} from "@/store/ProjectAnalysisStore";

const { ontology: proteinOntology, update: updateProteinOntology } = useProteinOntology();
const { ontology: proteomeOntology, update: updateProteomeOntology } = useProteomeOntology();
const customFilterStore = useCustomFilterStore();
const { formatNumber } = useNumberFormatter();

const taxonomyCommunicator = new TaxonomyResponseCommunicator(DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE);
const proteinCommunicator = new ProteinResponseCommunicator(DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE);

const { project } = defineProps<{
    project: ProjectAnalysisStore
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

const amountOfLinkedSamples = computed(() => {
    let count = 0;
    for (const group of project.groups) {
        for (const analysis of group.analyses) {
            if (analysis.config.database === databaseToManipulate.value) {
                count++;
            }
        }
    }
    return count;
});

const databases = computed(() => {
    return customFilterStore.filters.map(id => {
        const filter = customFilterStore.getFilterById(id)!;
        return {
            id: id,
            name: filter.name,
            type: showFilterType(filter.filter),
            taxaCount: taxonCounts.value.get(id) || 'computing...',
            proteinCount: proteinCounts.value.get(id) || 'computing...',
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
            const taxonomies = await taxonomyCommunicator.getResponses(filter.data as number[]);
            return taxonomies.reduce((acc, taxonomy) => acc + taxonomy.descendants.length, 0);
        case FilterType.Protein:
            const proteinData = filter.data as string[];
            await updateProteinOntology(proteinData);
            return new Set<number>(proteinData.map(p => proteinOntology.get(p)?.taxonId).filter(t => t !== undefined)).size
        case FilterType.Proteome:
        default:
            const proteomeData = filter.data as string[];
            await updateProteomeOntology(proteomeData);
            return new Set<number>(proteomeData.map(p => proteomeOntology.get(p)?.taxonId).filter(t => t !== undefined)).size
    }
};

const computeProteinCount = async (filter: Filter) => {
    switch (filter.filter) {
        case FilterType.UniProtKB:
            return await proteinCommunicator.getProteinCount();
        case FilterType.Taxon:
            return await UniprotCommunicator.getRecordCount(filter.data as number[]);
        case FilterType.Protein:
            return filter.data?.length || 0;
        case FilterType.Proteome:
        default:
            const proteomeData = filter.data as string[];
            await updateProteomeOntology(proteomeData);
            return proteomeData.reduce((acc, proteome) => acc + (proteomeOntology.get(proteome)?.proteinCount || 0), 0);
    }
};

const tableHeaders: any = [
    { title: 'Name', key: 'name' },
    { title: 'Type', key: 'type' },
    { title: '# Taxa', key: 'taxaCount', align: "end" },
    { title: '# Proteins', key: 'proteinCount', align: "end" },
    { title: 'Actions', key: 'actions', align: "end", sortable: false },
];

/**
 * Rounds a number and returns a formatted string.
 * - For values < 1,000,000: rounds to nearest thousand and returns "xxx thousand"
 * - For values >= 1,000,000: rounds to nearest million and returns "xxx million"
 *
 * @param value The number to round and format
 * @returns A formatted string representing the rounded value
 */
function smartRound(value: number): string {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (absValue < 1000000) {
        // Round to nearest thousand
        const roundedThousands = Math.round(absValue / 1000);
        return `${sign}${roundedThousands} thousand`;
    } else {
        // Round to nearest million
        const roundedMillions = Math.round(absValue / 1000000);
        return `${sign}${roundedMillions} million`;
    }
}

const editDatabase = (id: string) => {
    databaseToManipulate.value = id;
    editDatabaseDialogOpen.value = true;
};

const confirmEditDatabase = async (filter: Filter) => {
    emits('database:update', databaseToManipulate.value, filter);

    const taxonCount = await computeTaxonCount(filter);
    const proteinCount = await computeProteinCount(filter);
    taxonCounts.value.set(databaseToManipulate.value, `~ ${smartRound(taxonCount)}`);
    proteinCounts.value.set(databaseToManipulate.value, `~ ${smartRound(proteinCount)}`);
};

const deleteDatabase = (id: string) => {
    databaseToManipulate.value = id;
    deleteDatabaseDialogOpen.value = true;
};

const confirmDeleteDatabase = () => {
    emits('database:delete', databaseToManipulate.value);

    taxonCounts.value.delete(databaseToManipulate.value);
    proteinCounts.value.delete(databaseToManipulate.value);
    databaseToManipulate.value = '';
};

const duplicateDatabase = (id: string) => {
    const filter = customFilterStore.getFilterById(id)!;

    let counter = 1;
    while (customFilterStore.filterNames.find(s => s === `${filter.name} - copy ${counter}`)) {
        counter++;
    }

    const newName = `${filter.name} - copy ${counter}`;
    const newId = customFilterStore.addFilter({ ...filter, name: newName });
    taxonCounts.value.set(newId, taxonCounts.value.get(id)!);
    proteinCounts.value.set(newId, proteinCounts.value.get(id)!);
};

const createDatabase = () => databaseDialogOpen.value = true;

const confirmCreateDatabase = async (filter: Filter) => {
    const filterId = customFilterStore.addFilter(filter);
    const taxonCount = await computeTaxonCount(filter);
    const proteinCount = await computeProteinCount(filter);
    taxonCounts.value.set(filterId, `~ ${smartRound(taxonCount)}`);
    proteinCounts.value.set(filterId, `~ ${smartRound(proteinCount)}`);
}

const updateCounts = async () => {
    for (const filterId of customFilterStore.filters) {
        const filter = customFilterStore.getFilterById(filterId)!;
        const taxonCount = await computeTaxonCount(filter);
        const proteinCount = await computeProteinCount(filter);
        taxonCounts.value.set(filterId, `~ ${smartRound(taxonCount)}`);
        proteinCounts.value.set(filterId, `~ ${smartRound(proteinCount)}`);
    }
}

onMounted(updateCounts);
</script>

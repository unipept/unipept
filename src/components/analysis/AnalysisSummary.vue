<template>
    <v-card flat>
        <v-card-title>
            <span class="text-h4">{{ analysis.sample.name }}</span>
        </v-card-title>
        <v-card-text>
            <v-row class="mt-n6">
                <v-col cols="6">
                    <h2 class="pb-2">Analysis summary</h2>

                    <h4 class="font-weight-bold">3464 peptides found, 3485 peptides in assay</h4>
                    <h1 class="text-subtitle-1 mt-n2">xxxx could not be found</h1>

                    <h4 class="font-weight-bold">Last analysed on October 4 at 14:34</h4>
                    <h1 class="text-subtitle-1 mt-n2">Analysis is up-to-date, no need to restart the analysis.</h1>
                </v-col>
                <v-col cols="6">
                    <h2 class="pb-2">Analysis settings</h2>
                    <v-checkbox
                        v-model="equateIl"
                        color="primary"
                        label="Equate I and L"
                        density="compact"
                        hide-details
                    />
                    <v-checkbox
                        v-model="filterDuplicates"
                        color="primary"
                        label="Filter duplicate peptides"
                        density="compact"
                        hide-details
                    />
                    <v-checkbox
                        v-model="missedCleavages"
                        color="primary"
                        label="Enable missed cleavages"
                        density="compact"
                        hide-details
                        disabled
                    />
                    <v-select
                        v-model="selectedDatabase"
                        class="mt-1"
                        label="Selected database"
                        :items="['UniProtKB']"
                        variant="outlined"
                        density="compact"
                    >
                        <template #item="{ props }">
                            <v-list-item v-bind="props" density="compact" />
                        </template>

                        <template #append-item>
                            <v-divider class="my-1" />
                            <v-list-item class="mb-n2" density="compact" prepend-icon="mdi-database-plus" @click="createDatabaseOpen = true">
                                Create custom database
                            </v-list-item>
                        </template>
                    </v-select>
                    <div class="d-flex flex-column">
                        <v-btn
                            color="primary"
                            variant="tonal"
                            text="Update"
                        />
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-data-table
                        :headers="headers"
                        :items="peptides"
                        :items-per-page="5"
                        :server-items-length="0"
                        :loading="false"
                        density="compact"
                    >
                        <template #no-data>
                            <v-alert class="ma-3" density="compact" type="info" variant="tonal" text="No peptides found" />
                        </template>
                    </v-data-table>
                    <div class="d-flex flex-column">
                        <v-btn
                            color="primary"
                            variant="tonal"
                            text="Export results"
                            prepend-icon="mdi-download"
                        />
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>

    <create-custom-database v-model="createDatabaseOpen" />
</template>

<script setup lang="ts">
import {ref} from "vue";
import CreateCustomDatabase from "@/components/database/CreateCustomDatabase.vue";

const headers = [
    {
        title: "Peptide",
        align: "start",
        value: "peptide"
    },
    {
        title: "Occurrence",
        align: "start",
        value: "occurrence"
    },
    {
        title: "Lowest common ancestor",
        align: "start",
        value: "lca"
    },
    {
        title: "Rank",
        align: "start",
        value: "rank"
    }
]

const analysis = ref({
    sample: {
        name: "Clover 1",
        peptides: [
            "AALTER"
        ]
    },
    config: {
        equateIl: true,
        filterDuplicates: true,
        databaseFilter: "database1"
    },
    result: {}
})

const peptides = ref([
    {
        peptide: "AALTER",
        occurrence: 1,
        lca: "Proteobacteria",
        rank: "species"
    },
    {
        peptide: "AALTER",
        occurrence: 1,
        lca: "Proteobacteria",
        rank: "species"
    },
    {
        peptide: "AALTER",
        occurrence: 1,
        lca: "Proteobacteria",
        rank: "species"
    },
    {
        peptide: "AALTER",
        occurrence: 1,
        lca: "Proteobacteria",
        rank: "species"
    },
    {
        peptide: "AALTER",
        occurrence: 1,
        lca: "Proteobacteria",
        rank: "species"
    },
    {
        peptide: "AALTER",
        occurrence: 1,
        lca: "Proteobacteria",
        rank: "species"
    },
    {
        peptide: "AALTER",
        occurrence: 1,
        lca: "Proteobacteria",
        rank: "species"
    },
    {
        peptide: "AALTER",
        occurrence: 1,
        lca: "Proteobacteria",
        rank: "species"
    },
    {
        peptide: "AALTER",
        occurrence: 1,
        lca: "Proteobacteria",
        rank: "species"
    }
])

const equateIl = ref(true);
const filterDuplicates = ref(true);
const missedCleavages = ref(true);
const selectedDatabase = ref("UniProtKB");

const createDatabaseOpen = ref(false);
</script>

<style scoped>

</style>
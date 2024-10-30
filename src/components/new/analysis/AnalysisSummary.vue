<template>
    <v-card flat>
        <v-card-title>
            <span class="text-h4">{{ analysis.name }}</span>
        </v-card-title>
        <v-card-text>
            <v-row class="mt-n6">
                <v-col cols="6">
                    <h2 class="pb-2">
                        Analysis summary
                    </h2>

                    <h4 class="font-weight-bold">
                        {{ analysis.peptideTrust.matchedPeptides }} peptides found, {{ analysis.peptideTrust.searchedPeptides }} {{ analysis.config.filter ? "unique" : "" }} peptides in assay
                    </h4>
                    <h1 class="text-subtitle-1 mt-n2">
                        {{ analysis.peptideTrust.missedPeptides.length }} peptides ({{ displayPercentage(analysis.peptideTrust.missedPeptides.length / analysis.peptideTrust.searchedPeptides) }}) could not be found
                    </h1>

                    <h4 class="font-weight-bold">
                        Last analysed on October 4 at 14:34
                    </h4>
                    <h1 class="text-subtitle-1 mt-n2">
                        Analysis is up-to-date, no need to restart the analysis.
                    </h1>
                </v-col>
                <v-col
                    v-if="analysis.config"
                    cols="6"
                >
                    <h2 class="pb-2">
                        Analysis settings
                    </h2>
                    <v-checkbox
                        v-model="analysis.dirtyConfig.equate"
                        color="primary"
                        label="Equate I and L"
                        density="compact"
                        hide-details
                    />
                    <v-checkbox
                        v-model="analysis.dirtyConfig.filter"
                        color="primary"
                        label="Filter duplicate peptides"
                        density="compact"
                        hide-details
                    />
                    <v-checkbox
                        v-model="analysis.dirtyConfig.missed"
                        color="primary"
                        label="Enable missed cleavages"
                        density="compact"
                        hide-details
                        disabled
                    />
                    <database-select
                        v-model="analysis.dirtyConfig.database"
                        class="mt-1"
                        label="Selected database"
                    />
                    <div class="d-flex flex-column">
                        <v-btn
                            color="primary"
                            variant="tonal"
                            text="Update"
                            :disabled="!dirtyConfig"
                            @click="update"
                        />
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-data-table
                        :headers="headers"
                        :items="foundPeptides"
                        :items-per-page="5"
                        :loading="false"
                        density="compact"
                    >
                        <template #no-data>
                            <v-alert class="ma-3" density="compact" type="info" variant="tonal" text="No peptides found" />
                        </template>

                        <template #item.warning="{ item }">
                            <v-tooltip
                                v-if="!item.found"
                                text="This peptide was not found by Unipept"
                            >
                                <template #activator="{ props }">
                                    <v-icon
                                        v-if="!item.found"
                                        v-bind="props"
                                        color="warning"
                                        size="20"
                                        icon="mdi-alert-circle-outline"
                                    />
                                </template>
                            </v-tooltip>
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
</template>

<script setup lang="ts">
import DatabaseSelect from "@/components/new/database/DatabaseSelect.vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import {computed} from "vue";

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore
}>();

const emits = defineEmits<{
    update: () => void
}>();

const dirtyConfig = computed(() => analysis.isConfigDirty());
const foundPeptides = computed(() => [...analysis.peptidesTable.entries()].map(([peptide, count]) => ({
    peptide: peptide,
    occurrence: count,
    lca: analysis.peptideToLca.get(peptide) || "N/A",
    rank: "N/A",
    found: analysis.peptideToLca.has(peptide)
})));

const displayPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
};

const update = () => emits("update");
</script>

<script lang="ts">
const headers = [
    {
        title: "Peptide",
        align: "start",
        key: "peptide",
    },
    {
        title: "Occurrence",
        align: "start",
        key: "occurrence",
    },
    {
        title: "Lowest common ancestor",
        align: "start",
        key: "lca"
    },
    {
        title: "Rank",
        align: "start",
        key: "rank"
    },
    {
        title: "",
        align: "start",
        key: "warning",
        sortable: false
    }
];
</script>

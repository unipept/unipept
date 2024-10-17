<template>
    <v-card
        v-if="analysis !== undefined"
        flat
    >
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
                        {{ analysis.data.trust.matchedPeptides }} peptides found, {{ analysis.data.trust.searchedPeptides }} {{ analysis.config.filter ? "unique" : "" }} peptides in assay
                    </h4>
                    <h1 class="text-subtitle-1 mt-n2">
                        {{ analysis.data.trust.missedPeptides.length }} peptides ({{ displayPercentage(analysis.data.trust.missedPeptides.length / analysis.data.trust.searchedPeptides) }}) could not be found
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
</template>

<script setup lang="ts">
import DatabaseSelect from "@/components/new/database/DatabaseSelect.vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import {computed} from "vue";

const analysis = defineModel<SingleAnalysisStore | undefined>();

const dirtyConfig = computed(() => analysis.value?.isConfigDirty());
const foundPeptides = computed(() => Array.from(analysis.value?.data.peptideCountTable.counts).map(([peptide, count]) => ({
    peptide: peptide,
    occurrence: count,
    lca: "Unknown",
    rank: "Unknown",
})));

const displayPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
};

const update = async () => {
    analysis.value.updateConfig();
    await analysis.value.analyse();
};
</script>

<script lang="ts">
const headers = [
    {
        title: "Peptide",
        align: "start",
        value: "peptide",
    },
    {
        title: "Occurrence",
        align: "start",
        value: "occurrence",
        sortable: true
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
];
</script>

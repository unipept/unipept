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
                <v-col cols="6">
                    <h2 class="pb-2">
                        Analysis settings
                    </h2>
                    <v-checkbox
                        v-model="equate"
                        color="primary"
                        label="Equate I and L"
                        density="compact"
                        hide-details
                    />
                    <v-checkbox
                        v-model="filter"
                        color="primary"
                        label="Filter duplicate peptides"
                        density="compact"
                        hide-details
                    />
                    <v-checkbox
                        v-model="missed"
                        color="primary"
                        label="Enable missed cleavages"
                        density="compact"
                        hide-details
                        disabled
                    />
                    <database-select
                        v-model="database"
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
                    <analysis-summary-table :items="peptides" />
                    <div class="d-flex flex-column">
                        <analysis-summary-export @download="download" />
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import AnalysisSummaryTable from "@/components/new/analysis/AnalysisSummaryTable.vue";
import DatabaseSelect from "@/components/new/database/DatabaseSelect.vue";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import {computed, ref} from "vue";
import usePercentage from "@/composables/new/usePercentage";
import useOntologyStore from "@/store/new/OntologyStore";
import AnalysisSummaryExport from "@/components/new/analysis/AnalysisSummaryExport.vue";
import {AnalysisConfig} from "@/components/pages/TestPage.vue";

const { getNcbiDefinition } = useOntologyStore();
const { displayPercentage } = usePercentage();

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore
}>();

const emits = defineEmits<{
    update: (newConfig: AnalysisConfig) => void
}>();

const equate = ref(analysis.config.equate);
const filter = ref(analysis.config.filter);
const missed = ref(analysis.config.missed);
const database = ref(analysis.config.database);

const dirtyConfig = computed(() =>
    equate.value !== analysis.config.equate ||
    filter.value !== analysis.config.filter ||
    missed.value !== analysis.config.missed ||
    database.value !== analysis.config.database
);
const peptides = computed(() => [...analysis.peptidesTable.entries()].map(([peptide, count]) => {
    // TODO: use virtual mapping on the pept2data object to store memory
    const lca = analysis.peptideToLca.get(peptide);
    return {
        peptide: peptide,
        occurrence: count,
        lca: getNcbiDefinition(lca)?.name ?? "N/A",
        rank: getNcbiDefinition(lca)?.rank ?? "N/A",
        found: analysis.peptideToLca.has(peptide)
    };
}));

const download = (delimiter: string) => {
    // TODO: use pept2data object for peptide -> info mapping
    // Alternative: store extra mappings, but this will require more memory that we might not want to spend
    alert("Download not implemented yet");
};

const update = () => emits("update", {
    equate: equate.value,
    filter: filter.value,
    missed: missed.value,
    database: database.value
});
</script>

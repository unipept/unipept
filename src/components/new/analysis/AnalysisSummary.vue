<template>
    <v-card flat>
        <v-card-title>
            <span class="text-h4">{{ analysis.name }} ({{ groupName }})</span>
        </v-card-title>
        <v-card-text>
            <v-row class="mt-n6">
                <v-col cols="8">
                    <h2 class="pb-2">
                        Analysis summary
                    </h2>

                    <h3 class="font-weight-bold">
                        This sample contains {{ analysis.peptideTrust.searchedPeptides }} {{ analysis.config.filter ? "unique" : "" }} peptides, of which we matched {{ analysis.peptideTrust.matchedPeptides }} peptides.
                    </h3>
                    <h1 class="text-subtitle-1">
                        <a
                            @click="showMissingPeptides = true"
                        >
                            {{ analysis.peptideTrust.missedPeptides.length }} peptides
                        </a> ({{ displayPercentage(analysis.peptideTrust.missedPeptides.length / analysis.peptideTrust.searchedPeptides) }}) could not be found.
                    </h1>
                </v-col>
                <v-col cols="4">
                    <v-checkbox
                        :model-value="analysis.config.equate"
                        color="primary"
                        label="Equate I and L"
                        density="compact"
                        hide-details
                        readonly
                    />
                    <v-checkbox
                        :model-value="analysis.config.filter"
                        color="primary"
                        label="Filter duplicate peptides"
                        density="compact"
                        hide-details
                        readonly
                    />
                    <div class="d-flex align-center">
                        <v-checkbox
                            :model-value="analysis.config.missed"
                            color="primary"
                            density="compact"
                            hide-details
                            label="Advanced missed cleavages"
                            disabled
                        />
                        <v-tooltip width="30%">
                            <template #activator="{ props: tooltip }">
                                <v-icon
                                    v-bind="tooltip"
                                    class="ms-1"
                                    icon="mdi-information"
                                    size="small"
                                />
                            </template>
                            <span>
                                Missed cleavage handling is now always enabled. Because of a change in Unipept's underlying search
                                engine, enabling missed cleavage handling no longer results in a performance penalty. As a result,
                                this configuration option will be removed in a future release.
                            </span>
                        </v-tooltip>
                    </div>
<!--                    <database-select-->
<!--                        :model-value="analysis.config.database"-->
<!--                        class="mt-1"-->
<!--                        label="Selected database"-->
<!--                    />-->
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <div class="d-flex">
                        <h2 class="pb-2">
                            Peptide matches
                        </h2>
                        <v-spacer />
                        <analysis-summary-export @download="download" />
                    </div>
                    <analysis-summary-table :items="peptides" />
                </v-col>
            </v-row>
        </v-card-text>

        <missing-peptides-dialog
            v-model="showMissingPeptides"
            :peptides="missedPeptides"
        />
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
import useCsvDownload from "@/composables/new/useCsvDownload";
import usePeptideExport from "@/composables/new/usePeptideExport";
import MissingPeptidesDialog from "@/components/new/analysis/MissingPeptidesDialog.vue";

const { getNcbiDefinition } = useOntologyStore();
const { displayPercentage } = usePercentage();
const { generateExport } = usePeptideExport();
const { download: downloadCsv } = useCsvDownload();

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore
    groupName: string
}>();

const showMissingPeptides = ref(false);

const peptides = computed(() => [...analysis.peptidesTable!.entries()].map(([peptide, count]) => {
    const lca = analysis.peptideToLca!.get(peptide)!;
    return {
        peptide: peptide,
        occurrence: count,
        lca: getNcbiDefinition(lca)?.name ?? "N/A",
        rank: getNcbiDefinition(lca)?.rank ?? "N/A",
        found: analysis.peptideToLca!.has(peptide)
    };
}));
const missedPeptides = computed(() => {
    return analysis.peptideTrust!.missedPeptides;
});

const download = (separator: string) => {
    const extension = separator === "\t" ? "tsv" : "csv";
    const peptideExport = generateExport(analysis, ',');
    downloadCsv(peptideExport, `unipept_${analysis.name.replaceAll(" ", "_")}_mpa.${extension}`, separator);
};
</script>

<style scoped>
a {
    color: #2196f3;
    text-decoration: none;
}

a:hover {
    text-decoration: none;
}
</style>

<template>
    <v-unipept-card>
        <v-card-title>
            <span class="text-h4">{{ analysis.name }} ({{ group.name }})</span>
        </v-card-title>
        <v-card-text>
            <v-row class="mt-n6 d-flex align-center">
                <v-col cols="12" lg="8">
                    <h2 class="pb-2">
                        Analysis summary
                    </h2>

                    <template v-if="analysis.peptideTrust">
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

                        <v-alert
                            v-if="latest === analysis.databaseVersion"
                            color="success"
                            variant="tonal"
                            class="mt-3"
                            icon="mdi-check-circle"
                        >
                            <div class="font-weight-bold">Analysis up-to-date</div>
                            <div class="mb-1">Last analysed on {{ analysis.lastAnalysedString }}</div>
                            <div>Analysis is up-to-date with the latest UniProt release ({{ analysis.databaseVersion }}).</div>
                        </v-alert>

                        <v-alert
                            v-else
                            color="warning"
                            variant="tonal"
                            class="mt-3"
                            icon="mdi-history"
                        >
                            <v-tooltip text="Restart analysis">
                                <template #activator="{ props: tooltip }">
                                    <v-btn
                                        v-bind="tooltip"
                                        variant="outlined"
                                        size="small"
                                        @click="restartAnalysis"
                                        class="float-end"
                                        icon="mdi-restart"
                                    >
                                    </v-btn>
                                </template>
                            </v-tooltip>
                            <div>
                                <div class="font-weight-bold">Analysis Outdated</div>
                                <div class="mb-1">Last analysed on {{ analysis.lastAnalysedString }}</div>
                                <div>The results are based on database version {{ analysis.databaseVersion }}, but the latest UniProt release is {{ latest }}.</div>
                                <div class="text-caption mt-1">
                                    Warning: Reanalysing will update results to the latest database version ({{ latest }}). You will not be able to revert to the previous results.
                                </div>
                            </div>
                        </v-alert>
                    </template>
                </v-col>
                <v-col cols="12" lg="4">
                    <div class="mt-1">
                        <v-icon
                            class="ms-1"
                            :icon="analysis.config.equate ? 'mdi-check-circle' : 'mdi-close-circle'"
                            :color="analysis.config.equate ? 'success' : 'error'"
                        />
                        <span>
                            Equate I and L
                        </span>
                    </div>

                    <div class="mt-1">
                        <v-icon
                            class="ms-1"
                            :icon="analysis.config.filter ? 'mdi-check-circle' : 'mdi-close-circle'"
                            :color="analysis.config.filter ? 'success' : 'error'"
                        />
                        <span>
                            Filter duplicate peptides
                        </span>
                    </div>

                    <div class="mt-1 d-flex">
                        <v-icon
                            class="ms-1"
                            :icon="analysis.config.useCrap ? 'mdi-check-circle' : 'mdi-close-circle'"
                            :color="analysis.config.useCrap ? 'success' : 'error'"
                        />
                        <span class="ms-1">
                            Filter out cRAP
                        </span>
                        <v-tooltip width="30%">
                            <template #activator="{ props: tooltip }">
                                <v-icon
                                    v-bind="tooltip"
                                    class="ms-1 d-none d-lg-block"
                                    icon="mdi-information"
                                    size="small"
                                />
                            </template>
                            <span>
                                Remove common contaminants from the sample using the cRAP database (https://www.thegpm.org/crap/)
                            </span>
                        </v-tooltip>
                    </div>

                    <div class="mt-1">
                        <v-icon
                            class="ms-1"
                            icon="mdi-database"
                            color="grey"
                        />
                        <span>
                            Selected database: {{ databaseName }}
                        </span>
                    </div>

                    <div class="mt-5">
                        <v-icon
                            class="ms-1"
                            icon="mdi-pencil"
                            color="primary"
                        />
                        <a @click="editAnalysis">
                            Edit search parameters
                        </a>
                    </div>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" lg="8" class="pb-0">
                    <h2>
                        Peptide matches
                    </h2>
                </v-col>
                <v-col cols="12" lg="4" class="pb-0 pb-1">
                    <analysis-summary-export @prepareDownload="prepareDownload" @download="download" />
                </v-col>
                <v-col cols="12">
                    <analysis-summary-table :analysis="analysis" />
                </v-col>
            </v-row>
        </v-card-text>

        <missing-peptides-dialog
            v-model="showMissingPeptides"
            :peptides="missedPeptides"
        />
    </v-unipept-card>
</template>

<script setup lang="ts">
import AnalysisSummaryTable from "@/components/analysis/multi/AnalysisSummaryTable.vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {computed, onMounted, ref} from "vue";
import usePercentage from "@/composables/usePercentage";
import AnalysisSummaryExport from "@/components/analysis/multi/AnalysisSummaryExport.vue";
import useCsvDownload from "@/composables/useCsvDownload";
import usePeptideExport from "@/composables/usePeptideExport";
import MissingPeptidesDialog from "@/components/analysis/multi/MissingPeptidesDialog.vue";
import useMetaData from "@/composables/communication/unipept/useMetaData";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";
import UnipeptCommunicator from "@/logic/communicators/unipept/UnipeptCommunicator";
import useCustomFilterStore from "@/store/CustomFilterStore";

const customFilterStore = useCustomFilterStore();
const { displayPercentage } = usePercentage();
const { generateExport } = usePeptideExport();
const { download: downloadCsv } = useCsvDownload();
const { databaseVersion: latest, process } = useMetaData();

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore
    group: GroupAnalysisStore
}>();

const emits = defineEmits<{
    (e: 'edit'): void;
}>();

const showMissingPeptides = ref(false);

const databaseName = computed(() => customFilterStore.getFilterNameById(analysis.config.database) || "Invalid database");

const missedPeptides = computed(() => analysis.peptideTrust!.missedPeptides);

let peptideExportContent: string[][] = [];
let exportDelimiter: string = "";

const prepareDownload = async (separator: string, callback: () => void): Promise<void> => {
    exportDelimiter = separator;
    peptideExportContent = await generateExport(analysis, separator);
    callback();
};

const download = async (callback: () => void): Promise<void> => {
    const unipeptCommunicator = new UnipeptCommunicator();
    const uniprotVersion = await unipeptCommunicator.uniprotVersion();
    const exportExtension = exportDelimiter === "\t" ? "tsv" : "csv";
    await downloadCsv(peptideExportContent, `mpa_${analysis.name.replaceAll(" ", "_")}_unipept_${APP_VERSION}_UniProtKB_${uniprotVersion}.${exportExtension}`, exportDelimiter);
    callback();
}

const restartAnalysis = async () => {
    await analysis.analyse();
}

const editAnalysis = () => {
    emits('edit');
}

onMounted(process);
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

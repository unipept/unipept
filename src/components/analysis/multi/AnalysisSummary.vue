<template>
    <v-unipept-card>
        <v-card-title>
            <span class="text-h4">{{ analysis.name }} ({{ group.name }})</span>
        </v-card-title>
        <v-card-text>
            <v-row class="mt-n6 d-flex align-center">
                <v-col cols="8">
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

                        <h3 class="font-weight-bold mt-3">
                            Last analysed on {{ analysis.lastAnalysedString }}
                        </h3>

                        <h1 v-if="latest === analysis.databaseVersion" class="text-subtitle-1">
                            Analysis is up-to-date with the latest UniProt release ({{ analysis.databaseVersion }}).
                        </h1>

                        <h1 v-else class="text-subtitle-1">
                            Analysis is outdated. The latest UniProt release is {{ latest }}. Click <a @click="restartAnalysis">here</a> to restart the analysis.
                        </h1>
                    </template>
                </v-col>
                <v-col cols="4">
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

                    <div class="mt-1">
                        <v-icon
                            class="ms-1"
                            :icon="analysis.config.missed ? 'mdi-check-circle' : 'mdi-close-circle'"
                            :color="analysis.config.missed ? 'success' : 'error'"
                        />
                        <span>
                            Advanced missed cleavages
                        </span>
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
                <v-col cols="12">
                    <div class="d-flex">
                        <h2 class="pb-2">
                            Peptide matches
                        </h2>
                        <v-spacer />
                        <analysis-summary-export @prepareDownload="prepareDownload" @download="download" />
                    </div>
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

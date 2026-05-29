<template>
    <v-card-text>
        <v-row v-if="status === ECFunctionalAnalysisStatus.Pending">
            <v-col>
                <v-card class="pa-4">
                    <v-card-title>EC Functional Analysis</v-card-title>
                    <v-card-text>
                        <p>
                            The EC functional analysis is queued and will appear once processing completes.
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-else-if="status === ECFunctionalAnalysisStatus.Running">
            <v-col>
                <v-card class="pa-4">
                    <v-card-title>EC Functional Analysis Running</v-card-title>
                    <v-card-text>
                        <peptonizer-progress
                            :progress="currentProgress"
                            :eta="etaSeconds * 1000"
                            :peptonizer-started="analysisStarted"
                            :peptonizer-initialization-finished="analysisInitializationFinished"
                            :peptonizer-finished="false"
                        />
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-else-if="status === ECFunctionalAnalysisStatus.Finished">
            <v-col>
                <v-card class="pa-4">
                    <v-card-title>EC Functional Analysis Results</v-card-title>
                    <v-card-text>
                        <peptonizer-chart
                            v-if="ecTermsToConfidence"
                            :rank="'EC'"
                            :uses-default-scores="true"
                            :peptonizer-result="ecTermsToConfidence"
                        />
                    </v-card-text>
                    <v-card-actions>
                        <analysis-summary-export
                            @prepareDownload="exportCsv"
                            @download="downloadCsv"
                        />
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-else-if="status === ECFunctionalAnalysisStatus.Failed">
            <v-col>
                <v-alert
                    type="error"
                    title="EC Functional Analysis Failed"
                    :text="analysisError"
                    closable
                ></v-alert>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {ECFunctionalAnalysisStatus} from "@/store/ECFunctionalAnalysisStore";
import useCsvDownload from "@/composables/useCsvDownload";
import useEcFunctionalAnalysisExport from "@/composables/useEcFunctionalAnalysisExport";
import AnalysisSummaryExport from "@/components/analysis/multi/AnalysisSummaryExport.vue";
import PeptonizerProgress from "@/components/results/taxonomic/peptonizer/PeptonizerProgress.vue";
import PeptonizerChart from "@/components/results/taxonomic/peptonizer/PeptonizerChart.vue";
import type CountTable from "@/logic/processors/CountTable";

const { download } = useCsvDownload();
const { generateExport: generateEcExport } = useEcFunctionalAnalysisExport();

const props = defineProps<{
    store: any;
    peptideCountTable: CountTable<string>;
    peptidesFunctions?: Map<string, string[]>;
}>();

const status = computed(() => props.store.status);
const ecTermsToConfidence = computed<Map<string, number> | undefined>(() => props.store.ecTermsToConfidence);
const analysisStarted = computed(() => props.store.analysisStarted);
const analysisInitializationFinished = computed(() => props.store.analysisInitializationFinished);
const currentProgress = computed(() => props.store.currentProgress);
const etaSeconds = computed(() => props.store.etaSeconds);
const analysisError = computed(() => props.store.analysisError);

let exportRows: string[][] = [];
let exportDelimiter = "";

const exportCsv = async (delimiter: string, callback: () => void): Promise<void> => {
    exportDelimiter = delimiter;
    exportRows = generateEcExport(ecTermsToConfidence.value || new Map());
    callback();
};

const downloadCsv = async (callback: () => void): Promise<void> => {
    const exportExtension = exportDelimiter === "\t" ? "tsv" : "csv";
    await download(exportRows, `unipept_ec_functional_analysis.${exportExtension}`, exportDelimiter);
    callback();
};
</script>

<style scoped>
</style>

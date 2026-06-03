<template>
    <v-card-text>
        <v-row v-if="status === FunctionalAnalysisStatus.Pending">
            <v-col>
                <v-card class="pa-4">
                    <v-card-title>{{ title }}</v-card-title>
                    <v-card-text>
                        <p>
                            This functional analysis is queued and will appear once processing completes.
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-else-if="status === FunctionalAnalysisStatus.Running">
            <v-col>
                <v-card class="pa-4">
                    <v-card-title>{{ title }} Running</v-card-title>
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

        <v-row v-else-if="status === FunctionalAnalysisStatus.Finished">
            <v-col>
                <v-card class="pa-4">
                    <v-card-title>{{ title }} Results</v-card-title>
                    <v-card-text>
                        <peptonizer-chart
                            v-if="termsToConfidence"
                            :rank="rank"
                            :uses-default-scores="true"
                            :peptonizer-result="termsToConfidence"
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

        <v-row v-else-if="status === FunctionalAnalysisStatus.Failed">
            <v-col>
                <v-alert
                    type="error"
                    :title="`${title} Failed`"
                    :text="analysisError"
                    closable
                ></v-alert>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script setup lang="ts">
import {computed} from "vue";
import useCsvDownload from "@/composables/useCsvDownload";
import AnalysisSummaryExport from "@/components/analysis/multi/AnalysisSummaryExport.vue";
import PeptonizerProgress from "@/components/results/taxonomic/peptonizer/PeptonizerProgress.vue";
import PeptonizerChart from "@/components/results/taxonomic/peptonizer/PeptonizerChart.vue";
import {FunctionalAnalysisStatus} from "@/store/FunctionalAnalysisStatus";

const { download } = useCsvDownload();

const props = defineProps<{
    store: any;
    title: string;
    rank: string;
    filename: string;
    termHeader: string;
    nameHeader: string;
    resolver: (term: string) => string;
}>();

const status = computed(() => props.store.status);
const termsToConfidence = computed<Map<string, number> | undefined>(() => props.store.termsToConfidence);
const analysisStarted = computed(() => props.store.analysisStarted);
const analysisInitializationFinished = computed(() => props.store.analysisInitializationFinished);
const currentProgress = computed(() => props.store.currentProgress);
const etaSeconds = computed(() => props.store.etaSeconds);
const analysisError = computed(() => props.store.analysisError);

let exportRows: string[][] = [];
let exportDelimiter = "";

const generateExport = (data: Map<string, number>): string[][] => {
    const headers = [
        props.termHeader,
        props.nameHeader,
        "Confidence"
    ];

    const output: string[][] = [headers];
    for (const [term, confidence] of data) {
        output.push([
            term,
            props.resolver(term),
            confidence.toString()
        ]);
    }

    return output;
};

const exportCsv = async (delimiter: string, callback: () => void): Promise<void> => {
    exportDelimiter = delimiter;
    exportRows = generateExport(termsToConfidence.value || new Map());
    callback();
};

const downloadCsv = async (callback: () => void): Promise<void> => {
    const exportExtension = exportDelimiter === "\t" ? "tsv" : "csv";
    await download(exportRows, `${props.filename}.${exportExtension}`, exportDelimiter);
    callback();
};
</script>

<style scoped>
</style>

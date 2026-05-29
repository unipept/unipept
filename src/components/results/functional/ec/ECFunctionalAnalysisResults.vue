<template>
    <div>
        <v-row v-if="status === ECFunctionalAnalysisStatus.Pending">
            <v-col>
                <v-card class="pa-4">
                    <v-card-title>EC Functional Analysis</v-card-title>
                    <v-card-text>
                        <p>
                            Use the EC functional analysis to determine which EC terms are likely active based on
                            probabilistic inference. This analysis uses advanced Bayesian methods to compute confidence
                            scores for each EC term.
                        </p>
                        <v-select
                            v-model="ecPercentageFilter"
                            :items="[1, 5, 10, 20]"
                            label="EC Percentage Filter"
                            outlined
                            class="mt-4"
                        />
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            @click="startAnalysis"
                            color="primary"
                            variant="tonal"
                        >
                            Start Analysis
                        </v-btn>
                    </v-card-actions>
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
                            :peptonizer-started="true"
                            :peptonizer-initialization-finished="true"
                            :peptonizer-finished="false"
                        />
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            @click="cancelAnalysis"
                            color="warning"
                            variant="tonal"
                        >
                            Cancel
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-else-if="status === ECFunctionalAnalysisStatus.Finished">
            <v-col>
                <v-card class="pa-4">
                    <v-card-title>EC Functional Analysis Results</v-card-title>
                    <v-card-text>
                        <peptonizer-chart
                            :rank="'EC'"
                            :usesDefaultScores="true"
                            :peptonizer-result="ecIdsToConfidence || new Map()"
                        />

                        <!-- Visualization only: Peptonizer-style bar chart displays EC terms sorted by confidence -->
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            @click="downloadResults"
                            color="secondary"
                            variant="tonal"
                        >
                            Download Results
                        </v-btn>
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
    </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import useOntologyStore from "@/store/OntologyStore";
import {ECFunctionalAnalysisStatus} from "@/store/ECFunctionalAnalysisStore";
import useCsvDownload from "@/composables/useCsvDownload";
import useTimeFormatter from "@/composables/useTimeFormatter";
import CountTable from "@/logic/processors/CountTable";
import {ShareableMap} from "shared-memory-datastructures";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import PeptonizerProgress from "@/components/results/taxonomic/peptonizer/PeptonizerProgress.vue";
import PeptonizerChart from "@/components/results/taxonomic/peptonizer/PeptonizerChart.vue";

const { getEcDefinition } = useOntologyStore();
const { download } = useCsvDownload();
const { convertDurationToString } = useTimeFormatter();

const props = defineProps<{
    store: any;
    peptideCountTable: CountTable<string>;
    peptideToData: ShareableMap<string, PeptideData>;
    peptidesFunctions?: Map<string, string[]>;
}>();

const ecPercentageFilter = ref(5);

const status = computed(() => props.store.status);
const ecIdsToConfidence = computed<Map<string, number> | undefined>(() => props.store.ecIdsToConfidence);
const currentProgress = computed(() => props.store.currentProgress);
const etaSeconds = computed(() => props.store.etaSeconds);
const analysisError = computed(() => props.store.analysisError);

// ECFunctionalAnalysisStatus enum is imported above and available in template

const formatTime = (seconds: number) => {
    return convertDurationToString(Math.round(seconds));
};

const startAnalysis = async () => {
    if (props.store.status !== ECFunctionalAnalysisStatus.Pending) {
        return;
    }

    if (!props.peptidesFunctions || props.peptidesFunctions.size === 0) {
        return;
    }

    await props.store.runECFunctionalAnalysis(
        props.peptideCountTable,
        props.peptideToData,
        props.peptidesFunctions,
        false,
        undefined
    );
};

const cancelAnalysis = () => {
    props.store.cancelECFunctionalAnalysis();
};

const downloadResults = () => {
    if (!ecIdsToConfidence.value) return;

    const headers = ['EC Term', 'Description', 'Confidence Score (%)'];
    const rows: string[][] = [headers];

    const entries = Array.from(ecIdsToConfidence.value.entries()) as [string, number][];
    entries.sort((a, b) => b[1] - a[1]);

    for (const [ecTerm, confidence] of entries) {
        rows.push([
            ecTerm,
            getEcDefinition(ecTerm)?.name ?? 'Unknown',
            (confidence * 100).toFixed(2)
        ]);
    }

    download(rows, 'ec_functional_analysis.csv', ',');
};

// Visualization (chart) shows ECs sorted by confidence; no table needed here.
</script>

<style scoped>

</style>

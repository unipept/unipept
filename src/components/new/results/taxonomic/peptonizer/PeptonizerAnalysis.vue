<template>
    <v-card-text>
        <div class="d-flex align-center mb-5">
            <div class="mr-4">
                <h2>Peptonizer 2000</h2>
                <h3>Bringing confidence to metaproteomics!</h3>
                <p>
                    Leveraging peptide sequences and their corresponding scores,
                    the Peptonizer2000 uses advanced graphical modeling to deliver high-resolution, species-level
                    (or even strain-level) identifications. Unlike traditional approaches that rely solely on peptide-taxon
                    counts, this tool incorporates probabilistic inference to assess the likelihood of each taxon being
                    present in the analyzed ecosystem. Follow the steps in the wizard down below to try the
                    Peptonizer2000 right now!
                </p>
            </div>
            <img src="@/assets/logo/peptonizer_logo_simple.png" style="max-width: 175px;">
        </div>

        <v-window v-model="peptonizerStep">
            <v-window-item :value="1">
                <div>
                    <v-row>
                        <v-col :cols="12" class="pb-0">
                            <h4>General settings</h4>
                        </v-col>
                        <v-col :cols="6">
                            <v-select
                                label="Taxonomic rank"
                                v-model="peptonizerRank"
                                :items="peptonizerRankOptions"
                                hint="Choose the taxonomic rank at which the Peptonizer2000 will perform inference."
                                persistent-hint
                            />
                        </v-col>
                        <v-col :cols="6">
                            <v-number-input
                                v-model="taxaInGraph"
                                :step="5"
                                :min="10"
                                :max="150"
                                hint="Pick the amount of taxa that should be retained in the graph while running the Peptonizer. The higher the amount of taxa, the longer the analysis will usually take."
                                persistent-hint
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col :cols="12" class="pb-1">
                            <h4>Filter settings</h4>
                        </v-col>
                        <v-col :cols="12" class="pt-0">
                            <p>
                                You can restrict the Peptonizer's analysis to specific taxa by selecting them in the
                                filter below. Only the selected taxa, along with all their descendant taxa, will be
                                considered as potential candidates during taxonomic inference.
                            </p>
                            <v-card>
                                <taxa-browser :selected-items="selectedTaxa" />
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
                <v-divider class="mt-3 mb-1"></v-divider>
                <v-card-actions class="pb-0">
                    <v-spacer></v-spacer>
                    <v-btn
                        @click="startPeptonizer"
                        color="primary"
                        variant="tonal"
                    >
                        ↯ Start to peptonize!
                    </v-btn>
                </v-card-actions>
            </v-window-item>

            <v-window-item :value="2">
                <!-- Show progress of the current Peptonizer analysis -->
                <peptonizer-progress :workers="peptonizerWorkers" :progress="progress" :total-tasks="parameterTuningTasks" />

                <v-divider class="mt-2 mb-1"></v-divider>

                <v-card-actions>
                    <v-btn
                        @click="cancelPeptonizer"
                        color="red"
                        variant="tonal"
                        :loading="isCancelling"
                        prepend-icon="mdi-stop-circle-outline"
                    >
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-window-item>

            <v-window-item :value="3">
                <!-- Show final Peptonizer results to the user -->
                <peptonizer-chart
                    v-if="peptonizerStore.taxaNamesToConfidence"
                    :peptonizer-result="peptonizerStore.taxaNamesToConfidence!"
                />

                <v-divider></v-divider>

                <v-card-actions>
                    <v-btn
                        @click="peptonizerStep = 1"
                        color="red"
                        variant="tonal"
                        prepend-icon="mdi-restart"
                    >
                        Restart
                    </v-btn>
                    <v-spacer></v-spacer>
                    <analysis-summary-export @download="exportCsv"/>
                </v-card-actions>
            </v-window-item>
        </v-window>
    </v-card-text>
</template>

<script setup lang="ts">
import CountTable from "@/logic/new/CountTable";
import {DEFAULT_PEPTONIZER_WORKERS, PeptonizerStatus, PeptonizerStore} from "@/store/new/PeptonizerAnalysisStore";
import {onMounted, Ref, ref, watch} from "vue";
import { PeptonizerParameterSet, PeptonizerProgressListener, PeptonizerResult} from "peptonizer";
import PeptonizerProgress from "@/components/new/results/taxonomic/peptonizer/PeptonizerProgress.vue";
import PeptonizerChart from "@/components/new/results/taxonomic/peptonizer/PeptonizerChart.vue";
import TaxaBrowser from "@/components/new/taxon/TaxaBrowser.vue";
import NcbiTaxon, {NcbiRank} from "@/logic/new/ontology/taxonomic/Ncbi";
import usePeptonizerExport from "@/composables/new/usePeptonizerExport";
import useCsvDownload from "@/composables/new/useCsvDownload";
import AnalysisSummaryExport from "@/components/new/analysis/AnalysisSummaryExport.vue";

const props = defineProps<{
    peptideCountTable: CountTable<string>,
    peptideIntensities: Map<string, number> | undefined,
    equateIl: boolean,
    peptonizerStore: PeptonizerStore
}>();

export interface PeptonizerProgress {
    currentGraph: number,
    totalGraphs: number,
    currentIteration: number,
    totalIterations: number,
    currentResidual: number,
    minimumResidual: number,
    finished: boolean,
    graphParameters: PeptonizerParameterSet,
    workerId: number
}

const {generateExport: generatePeptonizerExport}  = usePeptonizerExport();
const {download: downloadCsv} = useCsvDownload();

// Maps worker ID onto the tasks that are being executed by the Peptonizer
const progress: Ref<Map<number, PeptonizerProgress[]>> = ref<Map<number, PeptonizerProgress[]>>(new Map())
const parameterTuningTasks: Ref<number> = ref(1);
const peptonizerWorkers: Ref<number> = ref(DEFAULT_PEPTONIZER_WORKERS);

const peptonizerStep: Ref<number> = ref(1);

const taxaInGraph: Ref<number> = ref(25);

const peptonizerRankOptions: Ref<string[]> = ref(
    Object.values(NcbiRank)
);
const peptonizerRank: Ref<string> = ref("species");

const selectedTaxa: Ref<NcbiTaxon[]> = ref([]);

class UIPeptonizerProgressListener implements PeptonizerProgressListener {
    peptonizerStarted(totalTasks: number, _taskSpecifications: PeptonizerParameterSet[]) {
        parameterTuningTasks.value = totalTasks
    }

    peptonizerFinished() {
        // Nothing to do...
    }

    peptonizerCancelled() {
        console.log("Peptonizer has been cancelled...");
    }

    taskStarted(parameterSet: PeptonizerParameterSet, workerId: number) {
        progress.value.get(workerId)!.push(
            {
                currentGraph: 0,
                totalGraphs: 0,
                currentIteration: 0,
                totalIterations: 0,
                currentResidual: 0,
                minimumResidual: 0,
                finished: false,
                graphParameters: parameterSet,
                workerId
            }
        );
    }

    taskFinished(_parameterSet: PeptonizerParameterSet, workerId: number) {
        const progressObj = progress.value.get(workerId)!.at(-1)!;
        progressObj.finished = true;
    }

    graphsUpdated(currentGraph: number, totalGraphs: number, workerId: number): void {
        const progressObj = progress.value.get(workerId)!.at(-1)!;
        progressObj.currentGraph = currentGraph;
        progressObj.totalGraphs = totalGraphs;
    }

    maxResidualUpdated(maxResidual: number, tolerance: number, workerId: number): void {
        const progressObj = progress.value.get(workerId)!.at(-1)!;
        progressObj.currentResidual = maxResidual;
        progressObj.minimumResidual = tolerance;
    }

    iterationsUpdated(currentIteration: number, totalIterations: number, workerId: number): void {
        const progressObj = progress.value.get(workerId)!.at(-1)!;
        progressObj.currentIteration = currentIteration;
        progressObj.totalIterations = totalIterations;
    }
}

const startPeptonizer = async () => {
    peptonizerStep.value = 2;

    for (let idx = 0; idx < DEFAULT_PEPTONIZER_WORKERS; idx++) {
        progress.value.set(idx, []);
    }

    await props.peptonizerStore.runPeptonizer(
        props.peptideCountTable,
        peptonizerRank.value as NcbiRank,
        taxaInGraph.value,
        new UIPeptonizerProgressListener(),
        props.equateIl,
        props.peptideIntensities,
    );

    if (props.peptonizerStore.taxaNamesToConfidence) {
        // Progress to final results when analysis is finished
        peptonizerStep.value = 3;
    }
}

const isCancelling: Ref<boolean> = ref(false);

const cancelPeptonizer = () => {
    isCancelling.value = true;
    props.peptonizerStore.cancelPeptonizer();
    peptonizerStep.value = 1;
    isCancelling.value = false;
}

const exportCsv = async (delimiter: string) => {
    const extension = delimiter === "\t" ? "tsv" : "csv";
    const peptideExport = generatePeptonizerExport(props.peptonizerStore.taxaIdsToConfidence!);
    await downloadCsv(peptideExport, `peptonizer.${extension}`, delimiter);
}

watch(() => props.peptonizerStore, () => {
    const peptonizerStatus = props.peptonizerStore.status;
    if (peptonizerStatus === PeptonizerStatus.Pending) {
        peptonizerStep.value = 1;
    } else if (peptonizerStatus === PeptonizerStatus.Running) {
        peptonizerStep.value = 2;
    } else {
        peptonizerStep.value = 3;
    }
});
</script>

<style scoped>

</style>
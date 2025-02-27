<template>
    <v-card-text>
        <v-window v-model="peptonizerStep">
            <v-window-item :value="1">
                <div class="d-flex align-center mb-5">
                    <div class="mr-4">
                        <h2>Peptonizer 2000</h2>
                        <h3>Bringing confidence to metaproteomics!</h3>
                        <p class="mb-0">
                            Leveraging peptide sequences and their corresponding scores,
                            the Peptonizer2000 uses advanced graphical modeling to deliver high-resolution, species-level
                            (or even strain-level) identifications. Unlike traditional approaches that rely solely on peptide-taxon
                            counts, this tool incorporates probabilistic inference to assess the likelihood of each taxon being
                            present in the analyzed ecosystem. Follow the steps in the wizard down below to try the
                            Peptonizer2000 right now!
                        </p>
                        <span class="text-subtitle-2 mt-0">Holstein et al. (2024) BioRXiv <a
                            href="https://doi.org/10.1101/2024.05.20.594958"
                            target="_blank"
                        >doi.org/10.1101/2024.05.20.594958</a></span>
                    </div>
                    <img
                        src="../../../../assets/logo/peptonizer_logo_simple.png"
                        style="max-width: 175px;"
                    >
                </div>
                <div>
                    <v-row>
                        <v-col
                            :cols="12"
                            class="pb-0"
                        >
                            <h4>General settings</h4>
                        </v-col>
                        <v-col :cols="6">
                            <v-select
                                v-model="peptonizerRank"
                                label="Taxonomic rank"
                                :items="peptonizerRankOptions"
                                hint="Choose the taxonomic rank at which the Peptonizer2000 will perform inference."
                                persistent-hint
                            />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col
                            :cols="12"
                            class="pb-1"
                        >
                            <h4>Filter settings</h4>
                        </v-col>
                        <v-col
                            :cols="12"
                            class="pt-0"
                        >
                            <p>
                                You can restrict the Peptonizer's analysis to specific taxa by selecting them in the
                                filter below. Only the selected taxa, along with all their descendant taxa, will be
                                considered as potential candidates during taxonomic inference.
                            </p>
                            <v-card elevation="0">
                                <taxa-browser v-model="peptonizerStore.selectedTaxa" />
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
                <v-divider class="mb-1" />
                <v-card-actions class="pb-0">
                    <v-spacer />
                    <v-btn
                        color="primary"
                        variant="tonal"
                        @click="startPeptonizer"
                    >
                        ↯ Start to peptonize!
                    </v-btn>
                </v-card-actions>
            </v-window-item>

            <v-window-item :value="2">
                <!-- Show progress of the current Peptonizer analysis -->
                <peptonizer-progress
                    class="mt-2 mb-4"
                    :progress="peptonizerStore.currentProgress"
                    :eta="peptonizerStore.etaSeconds"
                    :peptonizer-started="peptonizerStore.peptonizerStarted"
                    :peptonizer-initialization-finished="peptonizerStore.peptonizerInitalizationFinished"
                    :peptonizer-finished="peptonizerStore.peptonizerFinished"
                />

                <v-divider class="mt-2 mb-1" />

                <v-card-actions>
                    <v-btn
                        color="red"
                        variant="tonal"
                        :loading="isCancelling"
                        prepend-icon="mdi-stop-circle-outline"
                        @click="cancelPeptonizer"
                    >
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-window-item>

            <v-window-item :value="3">
                <template v-if="peptonizerStore.status === PeptonizerStatus.Finished">
                    <!-- Show final Peptonizer results to the user -->
                    <peptonizer-chart
                        v-if="peptonizerStore.taxaNamesToConfidence"
                        :rank="peptonizerRank"
                        :uses-default-scores="usesDefaultScores"
                        :peptonizer-result="peptonizerStore.taxaNamesToConfidence!"
                    />

                    <v-divider />

                    <v-card-actions>
                        <v-btn
                            variant="tonal"
                            prepend-icon="mdi-restart"
                            @click="peptonizerStep = 1"
                        >
                            New analysis
                        </v-btn>
                        <v-spacer />
                        <analysis-summary-export @prepareDownload="exportCsv" @download="downloadCsv" />
                    </v-card-actions>
                </template>

                <template v-if="peptonizerStore.status === PeptonizerStatus.Failed">
                    <v-alert
                        variant="tonal"
                        type="error"
                        class="my-2"
                    >
                        <div>
                            An error occurred while running Peptonizer. Please try again.
                            Please contact us if the issue persists.
                        </div>
                        <div class="font-weight-bold">
                            Error details:
                        </div>
                        <pre>{{ peptonizerStore.peptonizerError }}</pre>
                    </v-alert>

                    <v-divider />

                    <v-card-actions>
                        <v-btn
                            variant="tonal"
                            prepend-icon="mdi-restart"
                            @click="peptonizerStep = 1"
                        >
                            New analysis
                        </v-btn>
                    </v-card-actions>
                </template>
            </v-window-item>
        </v-window>
    </v-card-text>
</template>

<script setup lang="ts">
import CountTable from "@/logic/processors/CountTable";
import {PeptonizerStatus, PeptonizerStore} from "@/store/new/PeptonizerAnalysisStore";
import {Ref, ref, watch} from "vue";
import PeptonizerProgress from "@/components/results/taxonomic/peptonizer/PeptonizerProgress.vue";
import PeptonizerChart from "@/components/results/taxonomic/peptonizer/PeptonizerChart.vue";
import TaxaBrowser from "@/components/taxon/TaxaBrowser.vue";
import {NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
import usePeptonizerExport from "@/composables/usePeptonizerExport";
import useCsvDownload from "@/composables/useCsvDownload";
import AnalysisSummaryExport from "@/components/analysis/multi/AnalysisSummaryExport.vue";

const props = defineProps<{
    usesDefaultScores: boolean,
    sampleName: string,
    peptideCountTable: CountTable<string>,
    peptideIntensities: Map<string, number> | undefined,
    equateIl: boolean,
    peptonizerStore: PeptonizerStore
}>();

const {generateExport: generatePeptonizerExport}  = usePeptonizerExport();
const {download} = useCsvDownload();


const peptonizerStep: Ref<number> = ref(1);

const peptonizerRankOptions: Ref<string[]> = ref(
    Object.values(NcbiRank)
);
const peptonizerRank: Ref<string> = ref("species");

const startPeptonizer = async () => {
    peptonizerStep.value = 2;

    await props.peptonizerStore.runPeptonizer(
        props.peptideCountTable,
        peptonizerRank.value as NcbiRank,
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

let peptideExport: string[][] = [];
let exportDelimiter: string = "";

const exportCsv = async (delimiter: string, callback: () => void): Promise<void> => {
    exportDelimiter = delimiter;
    peptideExport = generatePeptonizerExport(props.peptonizerStore.taxaIdsToConfidence!);
    callback();
}

const downloadCsv = async (callback: () => void): Promise<void> => {
    const exportExtension = exportDelimiter === "\t" ? "tsv" : "csv";
    await download(peptideExport, `unipept_${props.sampleName.replaceAll(" ", "_")}_peptonizer.${exportExtension}`, exportDelimiter);
    callback();
}

watch(() => props.peptonizerStore.status, () => {
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
<template>
    <div class="mt-5">
        <v-row>
            <v-col sm="6">
                <select-dataset-card
                    v-if="selector"
                    style="min-height: 100%;"
                    @search="search"
                />
                <switch-dataset-card
                    v-else
                    style="min-height: 100%;"
                    :assay-selection-in-progress="true"
                />
            </v-col>
            <v-col sm="6">
                <load-datasets-card
                    v-if="!displaySummary"
                    style="min-height: 100%;"
                />
                <analysis-summary-card
                    v-else
                    style="min-height: 100%;"
                />
            </v-col>
        </v-row>

        <v-row v-if="multiAnalysisStore.activeAssayStatus">
            <v-col
                v-if="filtered()"
                cols="12"
            >
                <v-alert
                    class="mb-0"
                    type="info"
                    variant="outlined"
                >
                    <v-col class="grow pa-0">
                        <b>
                            Filtered results:
                        </b>
                        these results are limited to the {{ multiAnalysisStore.activeAssayStatus.filteredData.trust.matchedPeptides }} peptides specific to
                        <b>
                            {{ taxon()?.name }} ({{ taxon()?.rank }})
                        </b>
                    </v-col>
                    <v-col class="shrink pa-0 ml-3">
                        <v-btn
                            color="primary"
                            size="small"
                            @click="updateSelectedTaxonId(1)"
                        >
                            Reset filter
                        </v-btn>
                    </v-col>
                </v-alert>
            </v-col>

            <v-col
                class="pb-0"
                cols="12"
            >
                <visualization-overview
                    :analysis-in-progress="!multiAnalysisStore.analysisCompleted(multiAnalysisStore.activeAssayStatus.assay.id)"
                    :ec-tree="ecTree()"
                    :go-count-table-processor="multiAnalysisStore.activeAssayStatus?.filteredData?.goCountTableProcessor"
                    :go-ontology="multiAnalysisStore.activeAssayStatus?.goOntology"
                    :ec-count-table-processor="multiAnalysisStore.activeAssayStatus?.filteredData?.ecCountTableProcessor"
                    :ec-ontology="multiAnalysisStore.activeAssayStatus?.ecOntology"
                    :interpro-count-table-processor="multiAnalysisStore.activeAssayStatus?.filteredData?.interproCountTableProcessor"
                    :interpro-ontology="multiAnalysisStore.activeAssayStatus?.interproOntology"
                    :ncbi-count-table-processor="multiAnalysisStore.activeAssayStatus?.data?.lcaCountTableProcessor"
                    :ncbi-ontology="multiAnalysisStore.activeAssayStatus?.ncbiOntology"
                    :ncbi-tree="multiAnalysisStore.activeAssayStatus?.data?.tree"
                    :filter-id="multiAnalysisStore.activeAssayStatus?.filterId"
                    @update-selected-taxon-id="updateSelectedTaxonId"
                />
            </v-col>

            <v-col
                class="pt-2"
                cols="12"
            >
                <v-card>
                    <v-tabs
                        v-model="currentTab"
                        slider-color="secondary"
                        background-color="primary"
                        dark
                    >
                        <v-tab value="go-terms">
                            GO terms
                        </v-tab>
                        <v-tab value="ec-numbers">
                            EC numbers
                        </v-tab>
                        <v-tab value="interpro">
                            Interpro
                        </v-tab>
                        <v-spacer />
                        <v-menu
                            ref="sortMenu"
                            close-on-content-click
                            location="bottom"
                        >
                            <template #activator="{ props }">
                                <v-btn
                                    variant="text"
                                    v-bind="props"
                                    class="align-self-center mr-4"
                                    prepend-icon="mdi-sort-descending"
                                    append-icon="mdi-menu-down"
                                >
                                    {{ sortPeptidePercentage ? 'Peptides %' : 'Peptides' }}
                                </v-btn>
                            </template>

                            <v-list class="grey-lighten-3">
                                <v-list-item
                                    density="compact"
                                    class="menu-header"
                                    title="Sort by number of peptides in related proteins"
                                >
                                    Sort by number of peptides in related proteins
                                    <!-- TODO: fix sorting peptides modal here! -->
<!--                                    <sorting-peptides-modal />-->
                                </v-list-item>
                                <v-list-item
                                    title="Peptides %"
                                    @click="sortPeptidePercentage = true"
                                />
                                <v-list-item
                                    title="Peptides"
                                    @click="sortPeptidePercentage = false"
                                />
                            </v-list>
                        </v-menu>
                    </v-tabs>

                    <v-window
                        v-model="currentTab"
                        class="mb-5"
                    >
                        <v-window-item value="go-terms">
                            <go-summary-card
                                :analysis-in-progress="!multiAnalysisStore.analysisCompleted(multiAnalysisStore.activeAssayStatus.assay.id) || !multiAnalysisStore.filterCompleted(multiAnalysisStore.activeAssayStatus.assay.id)"
                                :go-processor="multiAnalysisStore.activeAssayStatus.filteredData?.goCountTableProcessor"
                                :go-ontology="multiAnalysisStore.activeAssayStatus?.goOntology"
                                :ncbi-processor="multiAnalysisStore.activeAssayStatus?.data?.lcaCountTableProcessor"
                                :ncbi-tree="multiAnalysisStore.activeAssayStatus?.data?.tree"
                                :show-percentage="sortPeptidePercentage"
                                :download-item="downloadGoItem"
                                :filter="multiAnalysisStore.activeAssayStatus.filterPercentage || 5"
                                @filter-percentage-change="onUpdateFilterPercentage"
                            />
                        </v-window-item>
                        <v-window-item value="ec-numbers">
                            <ec-summary-card
                                :analysis-in-progress="!multiAnalysisStore.analysisCompleted(multiAnalysisStore.activeAssayStatus.assay.id) || !multiAnalysisStore.filterCompleted(multiAnalysisStore.activeAssayStatus.assay.id)"
                                :ec-processor="multiAnalysisStore.activeAssayStatus.filteredData?.ecCountTableProcessor"
                                :ec-ontology="multiAnalysisStore.activeAssayStatus?.ecOntology"
                                :ec-tree="ecTree()"
                                :ncbi-processor="multiAnalysisStore.activeAssayStatus?.data?.lcaCountTableProcessor"
                                :ncbi-tree="multiAnalysisStore.activeAssayStatus?.data?.tree"
                                :show-percentage="sortPeptidePercentage"
                                :download-item="downloadEcItem"
                                :filter="multiAnalysisStore.activeAssayStatus.filterPercentage || 5"
                                @filter-percentage-change="onUpdateFilterPercentage"
                            />
                        </v-window-item>
                        <v-window-item value="interpro">
                            <interpro-summary-card
                                :analysis-in-progress="!multiAnalysisStore.analysisCompleted(multiAnalysisStore.activeAssayStatus.assay.id) || !multiAnalysisStore.filterCompleted(multiAnalysisStore.activeAssayStatus.assay.id)"
                                :interpro-processor="multiAnalysisStore.activeAssayStatus.filteredData?.interproCountTableProcessor"
                                :interpro-ontology="multiAnalysisStore.activeAssayStatus?.interproOntology"
                                :ncbi-processor="multiAnalysisStore.activeAssayStatus?.data?.lcaCountTableProcessor"
                                :ncbi-tree="multiAnalysisStore.activeAssayStatus?.data?.tree"
                                :show-percentage="sortPeptidePercentage"
                                :download-item="downloadInterproItem"
                                :filter="multiAnalysisStore.activeAssayStatus.filterPercentage || 5"
                                @filter-percentage-change="onUpdateFilterPercentage"
                            />
                        </v-window-item>
                    </v-window>
                </v-card>
            </v-col>
        </v-row>

        <v-row
            v-else
            class="search-info"
        >
            <v-col class="info-step">
                <h2>Select samples</h2>
                <p>
                    Make a selection of samples that should be analysed. New samples can be added by pasting a peptide list, or existing samples can be reused.
                </p>
            </v-col>
            <v-col class="info-step">
                <h2>Click search</h2>
                <p>
                    Review the search settings for peptide deduplication, advanced missed cleavage handling and equating isoleucine and leucine before clicking search.
                </p>
            </v-col>
            <v-col class="info-step">
                <h2>Gain insight</h2>
                <p>
                    For each of the peptides, the lowest common ancestor (LCA) will be calculated, aggregated and visualised on the result page, giving you insight in the taxonomic diversity of your sample.
                </p>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import LoadDatasetsCard from '@/components/cards/analysis/multi/LoadDatasetsCard.vue';
import SelectDatasetCard from '@/components/cards/analysis/multi/SelectDatasetCard.vue';
import SwitchDatasetCard from '@/components/cards/analysis/multi/SwitchDatasetCard.vue';
import { onUnmounted, ref } from 'vue';
import AnalysisSummaryCard from '@/components/cards/analysis/multi/AnalysisSummaryCard.vue';
import {
    GoSummaryCard,
    EcSummaryCard,
    InterproSummaryCard,
    VisualizationOverview,
    computeEcTree,
    EcCode,
    CsvUtils,
    FunctionalSummaryProcessor,
    PeptideCountTableProcessor,
    useCsvDownload,
    PeptideData,
    FunctionalCode,
    Ontology, NcbiTaxon, NcbiId, EcDefinition
} from "unipept-web-components";
import { storeToRefs } from 'pinia';
import useMultiAnalysis from "@/store/MultiAnalysisStore";

const multiAnalysisStore = useMultiAnalysis();

const { activeAssayStatus } = storeToRefs(multiAnalysisStore);

const selector = ref<boolean>(true);
const displaySummary = ref<boolean>(false);
const sortPeptidePercentage = ref<boolean>(false);

const currentTab = ref<number>(0);

const { downloadString } = useCsvDownload();

const filtered = () => {
    if(multiAnalysisStore.activeAssayStatus?.filterId) {
        return multiAnalysisStore.activeAssayStatus?.filterId !== 1;
    }

    return false;
};

const taxon = () => {
    if(multiAnalysisStore.activeAssayStatus) {
        return multiAnalysisStore.activeAssayStatus.ncbiOntology.getDefinition(multiAnalysisStore.activeAssayStatus.filterId);
    }

    return undefined;
};

const search = () => {
    selector.value = false;
    displaySummary.value = true;
}

const ecTree = () => {
    if(multiAnalysisStore.activeAssayStatus) {
        if(multiAnalysisStore.analysisCompleted(multiAnalysisStore.activeAssayStatus.assay.id)) {
            return computeEcTree(
                multiAnalysisStore.activeAssayStatus.filteredData?.ecCountTableProcessor.getCountTable(),
                // Cast: https://github.com/vuejs/pinia/issues/871
                multiAnalysisStore.activeAssayStatus.ecOntology as Ontology<EcCode, EcDefinition>,
            );
        }
    }

    return undefined;
};

const updateSelectedTaxonId = (taxonId: number) => {
    if(multiAnalysisStore.activeAssayStatus) {
        multiAnalysisStore.filterAssayByRank(multiAnalysisStore.activeAssayStatus.assay.id, taxonId);
    }
}

const onUpdateFilterPercentage = (percentage: number) => {
    if(multiAnalysisStore.activeAssayStatus) {
        multiAnalysisStore.filterAssayByPercentage(multiAnalysisStore.activeAssayStatus.assay.id, percentage);
    }
}

onUnmounted(() => {
    selector.value = true;
    multiAnalysisStore.removeAllAssays();
    displaySummary.value = false;
    sortPeptidePercentage.value = false;
});

const downloadItem = async (processor: any, ontology: any, code: FunctionalCode) => {
    if(!activeAssayStatus.value) {
        return;
    }

    const peptideTableProcessor = new PeptideCountTableProcessor();
    const peptideCounts = await peptideTableProcessor.getPeptideCountTable(
        processor.getAnnotationPeptideMapping().get(code)!,
        activeAssayStatus.value.cleavageHandling,
        activeAssayStatus.value.filterDuplicates,
        activeAssayStatus.value.equateIl
    );

    const functionalSummaryProcessor = new FunctionalSummaryProcessor();
    const data = await functionalSummaryProcessor.summarizeFunctionalAnnotation(
        ontology.getDefinition(code)!,
        peptideCounts,
        activeAssayStatus.value.pept2Data,
        // Cast: https://github.com/vuejs/pinia/issues/871
        activeAssayStatus.value.ncbiOntology as Ontology<NcbiId, NcbiTaxon>,
        (peptideData: PeptideData) => peptideData.ec
    );

    const dataString = CsvUtils.toCsvString(data);

    downloadString(dataString, code.replace(/:/g, "_") + ".csv")
}

const downloadEcItem = async (code: EcCode) => {
    downloadItem(activeAssayStatus.value?.filteredData?.ecCountTableProcessor, activeAssayStatus.value?.ecOntology, code);
}

const downloadGoItem = async (code: string) => {
    downloadItem(activeAssayStatus.value?.filteredData?.goCountTableProcessor, activeAssayStatus.value?.goOntology, code);
}

const downloadInterproItem = async (code: string) => {
    downloadItem(activeAssayStatus.value?.filteredData?.interproCountTableProcessor, activeAssayStatus.value?.interproOntology, code);
}
</script>

<style scoped>
.search-info {
    margin-top: 36px;
}

.info-step h2 {
    font-size: 24px;
}
.info-step p {
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    margin-top: 16px;
}

:deep(.v-alert__wrapper) {
    display: flex !important;
    align-items: center;
}

:deep(.v-alert__content) {
    display: flex;
}
</style>

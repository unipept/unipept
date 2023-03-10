<template>
    <div class="mt-5">
        <v-row>
            <v-col cols=12 sm=6>
                <SelectDatasetCard v-if="selector"
                    style="min-height: 100%;"
                    @search="search"
                />
                <SwitchDatasetCard v-else
                    style="min-height: 100%;"
                    :assaySelectionInProgress="true" 
                />
            </v-col>
            <v-col cols=12 sm=6>
                <LoadDatasetsCard v-if="!displaySummary"
                    style="min-height: 100%;" 
                />
                <AnalysisSummaryCard v-else style="min-height: 100%;" />
            </v-col>
        </v-row>

        <v-row v-if="multiAnalysisStore.activeAssayStatus">
            <v-col v-if="filtered()">
                <v-alert class="mb-0" type="info" text outlined>
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
                        <v-btn @click="updateSelectedTaxonId(1)" color="primary" small>Reset filter</v-btn>
                    </v-col>
                </v-alert>
            </v-col>

            <v-col class="pb-0" cols=12>
                <VisualizationOverview
                    :analysisInProgress="!multiAnalysisStore.analysisCompleted(multiAnalysisStore.activeAssayStatus.assay.id)"
                    :ecTree="ecTree()"
                    :goCountTableProcessor="multiAnalysisStore.activeAssayStatus?.filteredData?.goCountTableProcessor"
                    :goOntology="multiAnalysisStore.activeAssayStatus?.goOntology" 
                    :ecCountTableProcessor="multiAnalysisStore.activeAssayStatus?.filteredData?.ecCountTableProcessor"
                    :ecOntology="multiAnalysisStore.activeAssayStatus?.ecOntology"
                    :interproCountTableProcessor="multiAnalysisStore.activeAssayStatus?.filteredData?.interproCountTableProcessor"
                    :interproOntology="multiAnalysisStore.activeAssayStatus?.interproOntology"
                    :ncbiCountTableProcessor="multiAnalysisStore.activeAssayStatus?.data?.lcaCountTableProcessor"
                    :ncbiOntology="multiAnalysisStore.activeAssayStatus?.ncbiOntology"
                    :ncbiTree="multiAnalysisStore.activeAssayStatus?.data?.tree"
                    :filterId="multiAnalysisStore.activeAssayStatus?.filterId"
                    @update-selected-taxon-id="updateSelectedTaxonId"
                />
            </v-col>

            <v-col class="pt-2" cols=12>
                <v-card>
                    <v-tabs 
                        slider-color="secondary" 
                        background-color="primary" 
                        dark 
                        v-model="currentTab"
                    >
                        <v-tab>GO terms</v-tab>
                        <v-tab>EC numbers</v-tab>
                        <v-tab>Interpro</v-tab>
                        <v-spacer/>
                        <v-menu close-on-content-click bottom left ref="sortMenu">
                            <template v-slot:activator="{ on }">
                                <v-btn text class="align-self-center mr-4" v-on="on">
                                    <v-icon left>mdi-sort-descending</v-icon>
                                    {{ sortPeptidePercentage ? 'Peptides %' : 'Peptides' }}
                                    <v-icon right>mdi-menu-down</v-icon>
                                </v-btn>
                            </template>

                            <v-list class="grey lighten-3">
                                <v-list-item dense class="menu-header">
                                    <v-list-item-title>
                                        Sort by number of peptides in related proteins
                                        <SortingPeptidesModal />
                                    </v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="sortPeptidePercentage = true">
                                    <v-list-item-title>
                                        Peptides %
                                    </v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="sortPeptidePercentage = false">
                                    <v-list-item-title>
                                        Peptides
                                    </v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-tabs>

                    <v-tabs-items class="mb-5" v-model="currentTab">
                        <v-tab-item>
                            <GoSummaryCard
                                :analysisInProgress="!multiAnalysisStore.analysisCompleted(multiAnalysisStore.activeAssayStatus.assay.id) || !multiAnalysisStore.filterCompleted(multiAnalysisStore.activeAssayStatus.assay.id)"
                                :goProcessor="multiAnalysisStore.activeAssayStatus.filteredData?.goCountTableProcessor"
                                :goOntology="multiAnalysisStore.activeAssayStatus?.goOntology"
                                :ncbiProcessor="multiAnalysisStore.activeAssayStatus?.data?.lcaCountTableProcessor"
                                :ncbiTree="multiAnalysisStore.activeAssayStatus?.data?.tree"
                                :showPercentage="sortPeptidePercentage"
                                :downloadItem="downloadGoItem"
                                :filter="multiAnalysisStore.activeAssayStatus.filterPercentage || 5"
                                @filerPercentageChange="onUpdateFilterPercentage"
                            />
                        </v-tab-item>
                        <v-tab-item>
                            <EcSummaryCard
                                :analysisInProgress="!multiAnalysisStore.analysisCompleted(multiAnalysisStore.activeAssayStatus.assay.id) || !multiAnalysisStore.filterCompleted(multiAnalysisStore.activeAssayStatus.assay.id)"
                                :ecProcessor="multiAnalysisStore.activeAssayStatus.filteredData?.ecCountTableProcessor"
                                :ecOntology="multiAnalysisStore.activeAssayStatus?.ecOntology"
                                :ecTree="ecTree()"
                                :ncbiProcessor="multiAnalysisStore.activeAssayStatus?.data?.lcaCountTableProcessor"
                                :ncbiTree="multiAnalysisStore.activeAssayStatus?.data?.tree"
                                :showPercentage="sortPeptidePercentage"
                                :downloadItem="downloadEcItem"
                                :filter="multiAnalysisStore.activeAssayStatus.filterPercentage || 5"
                                @filerPercentageChange="onUpdateFilterPercentage"
                            />
                        </v-tab-item>
                        <v-tab-item>
                            <InterproSummaryCard
                                :analysisInProgress="!multiAnalysisStore.analysisCompleted(multiAnalysisStore.activeAssayStatus.assay.id) || !multiAnalysisStore.filterCompleted(multiAnalysisStore.activeAssayStatus.assay.id)"
                                :interproProcessor="multiAnalysisStore.activeAssayStatus.filteredData?.interproCountTableProcessor"
                                :interproOntology="multiAnalysisStore.activeAssayStatus?.interproOntology"
                                :ncbiProcessor="multiAnalysisStore.activeAssayStatus?.data?.lcaCountTableProcessor"
                                :ncbiTree="multiAnalysisStore.activeAssayStatus?.data?.tree"
                                :showPercentage="sortPeptidePercentage"
                                :downloadItem="downloadInterproItem"
                                :filter="multiAnalysisStore.activeAssayStatus.filterPercentage || 5"
                                @filerPercentageChange="onUpdateFilterPercentage"
                            />
                        </v-tab-item>
                    </v-tabs-items>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-else class="search-info">
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
import { GoSummaryCard, EcSummaryCard, InterproSummaryCard, VisualizationOverview, computeEcTree, EcCode, CsvUtils, FunctionalSummaryProcessor, PeptideCountTableProcessor, useCsvDownload, PeptideData, FunctionalCode } from 'unipept-web-components';
import useMultiAnalysis from '@/stores/MultiAnalysisStore';
import SortingPeptidesModal from '@/components/modals/SortingPeptidesModal.vue';
import { VRow, VCol, VCard, VTabs, VTab, VSpacer, VMenu, VBtn, VIcon, VList, VListItem, VListItemTitle, VTabsItems, VTabItem } from 'vuetify/lib';
import { storeToRefs } from 'pinia';

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
                // @ts-ignore
                multiAnalysisStore.activeAssayStatus.ecOntology,
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
        // @ts-ignore
        activeAssayStatus.value.ncbiOntology,
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

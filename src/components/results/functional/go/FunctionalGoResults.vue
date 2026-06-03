<template>
    <div v-if="!loading">
        <v-row class="mb-1">
            <v-col>
                <slot name="trust" />
            </v-col>
        </v-row>

        <h2 class="py-2">
            Biological Process
        </h2>
        <v-row>
            <v-col cols="12" lg="9">
                <go-results-table
                    :items="biologicalProcessItems"
                    :data="data"
                    :show-percentage="showPercentage"
                    :show-download-item="showDownloadItem"
                    @download-item="downloadItem"
                    @download-table="downloadTable"
                />
            </v-col>
            <v-col cols="12" lg="3">
                <quick-go-card
                    :items="biologicalProcessItems"
                    :namespace="GoNamespace.BiologicalProcess"
                    :n="3"
                />
            </v-col>
        </v-row>

        <h2 class="py-2">
            Cellular Component
        </h2>
        <v-row>
            <v-col cols="12" lg="9">
                <go-results-table
                    :items="cellularComponentItems"
                    :data="data"
                    :show-percentage="showPercentage"
                    :show-download-item="showDownloadItem"
                    @download-item="downloadItem"
                    @download-table="downloadTable"
                />
            </v-col>
            <v-col cols="12" lg="3">
                <quick-go-card
                    :items="cellularComponentItems"
                    :namespace="GoNamespace.CellularComponent"
                    :n="3"
                />
            </v-col>
        </v-row>

        <h2 class="py-2">
            Molecular Function
        </h2>
        <v-row>
            <v-col cols="12" lg="9">
                <go-results-table
                    :items="molecularFunctionItems"
                    :data="data"
                    :show-percentage="showPercentage"
                    :show-download-item="showDownloadItem"
                    @download-item="downloadItem"
                    @download-table="downloadTable"
                />
            </v-col>
            <v-col cols="12" lg="3">
                <quick-go-card
                    :items="molecularFunctionItems"
                    :namespace="GoNamespace.MolecularFunction"
                    :n="3"
                />
            </v-col>
        </v-row>

        <h2 class="py-2">
            GO Functional Analysis
        </h2>

        <v-row v-if="analysis && analysis.goFunctionalAnalysisStore">
            <v-col cols="12">
                <functional-terms-analysis-results
                    :store="biologicalProcessAnalysisStore"
                    title="GO Biological Process Functional Analysis"
                    rank="GO BP"
                    filename="unipept_go_biological_process_functional_analysis"
                    term-header="GO term"
                    name-header="GO name"
                    :resolver="resolveName"
                />
            </v-col>
        </v-row>

        <v-row v-if="analysis && analysis.goFunctionalAnalysisStore">
            <v-col cols="12">
                <functional-terms-analysis-results
                    :store="cellularComponentAnalysisStore"
                    title="GO Cellular Component Functional Analysis"
                    rank="GO CC"
                    filename="unipept_go_cellular_component_functional_analysis"
                    term-header="GO term"
                    name-header="GO name"
                    :resolver="resolveName"
                />
            </v-col>
        </v-row>

        <v-row v-if="analysis && analysis.goFunctionalAnalysisStore">
            <v-col cols="12">
                <functional-terms-analysis-results
                    :store="molecularFunctionAnalysisStore"
                    title="GO Molecular Function Functional Analysis"
                    rank="GO MF"
                    filename="unipept_go_molecular_function_functional_analysis"
                    term-header="GO term"
                    name-header="GO name"
                    :resolver="resolveName"
                />
            </v-col>
        </v-row>
    </div>

    <div v-else>
        <filter-progress text="The GO terms are currently being filtered." />
    </div>
</template>

<script setup lang="ts">
import GoResultsTable from "./GoResultsTable.vue";
import {computed} from "vue";
import QuickGoCard from "@/components/results/functional/go/QuickGoCard.vue";
import useOntologyStore from "@/store/OntologyStore";
import CountTable from "@/logic/processors/CountTable";
import FilterProgress from "@/components/results/functional/FilterProgress.vue";
import GoTableData from "@/components/results/functional/go/GoTableData";
import {GoResultsTableItem} from "@/components/results/functional/go/GoResultsTable.vue";
import {GoNamespace} from "@/logic/communicators/unipept/functional/GoResponse";
import FunctionalTermsAnalysisResults from "@/components/results/functional/FunctionalTermsAnalysisResults.vue";

const { getGoDefinition } = useOntologyStore();

const { data, loading, showDownloadItem = true, analysis = undefined } = defineProps<{
    data: GoTableData;
    loading: boolean;
    showPercentage: boolean;
    showDownloadItem?: boolean;
    analysis?: any;
}>();

const emits = defineEmits<{
    (e: 'downloadItem', item: GoResultsTableItem): void;
    (e: 'downloadTable', items: GoResultsTableItem[]): void;
}>();

const biologicalProcessItems = computed(() => getItems(data.goTable).filter(x => x.namespace == GoNamespace.BiologicalProcess));
const cellularComponentItems = computed(() => getItems(data.goTable).filter(x => x.namespace == GoNamespace.CellularComponent));
const molecularFunctionItems = computed(() => getItems(data.goTable).filter(x => x.namespace == GoNamespace.MolecularFunction));

const getItems = (items: CountTable<string>) => {
    return Array.from(items.counts.entries())
        .map(([key, value]) => ({
            code: key,
            name: getGoDefinition(key)?.name ?? "Unknown",
            namespace: getGoDefinition(key)?.namespace ?? "Unknown",
            count: value,
            totalCount: data.goTrust.totalItems,
        }));
}

const downloadItem = (item: GoResultsTableItem) => {
    emits('downloadItem', item);
}

const downloadTable = (items: GoResultsTableItem[]) => {
    emits('downloadTable', items);
}

const biologicalProcessAnalysisStore = computed(() => ({
    status: analysis?.goFunctionalAnalysisStore?.biologicalProcessStatus,
    termsToConfidence: analysis?.goFunctionalAnalysisStore?.biologicalProcessTermsToConfidence,
    analysisStarted: analysis?.goFunctionalAnalysisStore?.biologicalProcessAnalysisStarted,
    analysisInitializationFinished: analysis?.goFunctionalAnalysisStore?.biologicalProcessAnalysisInitializationFinished,
    currentProgress: analysis?.goFunctionalAnalysisStore?.biologicalProcessCurrentProgress,
    etaSeconds: analysis?.goFunctionalAnalysisStore?.biologicalProcessEtaSeconds,
    analysisError: analysis?.goFunctionalAnalysisStore?.biologicalProcessAnalysisError
}));

const cellularComponentAnalysisStore = computed(() => ({
    status: analysis?.goFunctionalAnalysisStore?.cellularComponentStatus,
    termsToConfidence: analysis?.goFunctionalAnalysisStore?.cellularComponentTermsToConfidence,
    analysisStarted: analysis?.goFunctionalAnalysisStore?.cellularComponentAnalysisStarted,
    analysisInitializationFinished: analysis?.goFunctionalAnalysisStore?.cellularComponentAnalysisInitializationFinished,
    currentProgress: analysis?.goFunctionalAnalysisStore?.cellularComponentCurrentProgress,
    etaSeconds: analysis?.goFunctionalAnalysisStore?.cellularComponentEtaSeconds,
    analysisError: analysis?.goFunctionalAnalysisStore?.cellularComponentAnalysisError
}));

const molecularFunctionAnalysisStore = computed(() => ({
    status: analysis?.goFunctionalAnalysisStore?.molecularFunctionStatus,
    termsToConfidence: analysis?.goFunctionalAnalysisStore?.molecularFunctionTermsToConfidence,
    analysisStarted: analysis?.goFunctionalAnalysisStore?.molecularFunctionAnalysisStarted,
    analysisInitializationFinished: analysis?.goFunctionalAnalysisStore?.molecularFunctionAnalysisInitializationFinished,
    currentProgress: analysis?.goFunctionalAnalysisStore?.molecularFunctionCurrentProgress,
    etaSeconds: analysis?.goFunctionalAnalysisStore?.molecularFunctionEtaSeconds,
    analysisError: analysis?.goFunctionalAnalysisStore?.molecularFunctionAnalysisError
}));

const resolveName = (term: string) => getGoDefinition(term)?.name || "";
</script>

<style scoped>

</style>

<template>
    <div v-if="!loading">
        <v-row class="mb-1">
            <v-col>
                <slot name="trust" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <v-select
                    v-model="selectedNamespace"
                    :items="namespaces"
                    label="InterPro category"
                    density="compact"
                    variant="outlined"
                    hide-details
                />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <ipr-results-table
                    :items="filteredItems"
                    :data="data"
                    :show-percentage="showPercentage"
                    :show-download-item="showDownloadItem"
                    @download-item="downloadItem"
                    @download-table="downloadTable"
                />
            </v-col>
        </v-row>

        <v-row v-if="analysis && analysis.interproFunctionalAnalysisStore">
            <v-col cols="12">
                <functional-terms-analysis-results
                    :store="analysisStore"
                    title="InterPro Functional Analysis"
                    rank="InterPro"
                    filename="unipept_interpro_functional_analysis"
                    term-header="InterPro entry"
                    name-header="InterPro name"
                    :resolver="resolveName"
                />
            </v-col>
        </v-row>
    </div>

    <div v-else>
        <filter-progress text="The InterPro entries are currently being filtered." />
    </div>
</template>

<script setup lang="ts">
import IprResultsTable, {IprResultsTableItem} from "@/components/results/functional/ipr/IprResultsTable.vue";
import {computed, ref} from "vue";
import useOntologyStore from "@/store/OntologyStore";
import FilterProgress from "@/components/results/functional/FilterProgress.vue";
import InterproTableData from "@/components/results/functional/ipr/InterproTableData";
import FunctionalTermsAnalysisResults from "@/components/results/functional/FunctionalTermsAnalysisResults.vue";

const { getIprDefinition } = useOntologyStore();

const { data, showDownloadItem = true, analysis = undefined } = defineProps<{
    data: InterproTableData;
    loading: boolean;
    showPercentage: boolean;
    showDownloadItem?: boolean;
    analysis?: any;
}>();

const emits = defineEmits<{
    (e: 'downloadItem', item: IprResultsTableItem): void;
    (e: 'downloadTable', items: IprResultsTableItem[]): void;
}>();

const selectedNamespace = ref<string>("all");

const items = computed(() => Array.from(data.iprTable!.counts.entries()).map(([key, value]) => {
    return {
        code: key,
        name: getIprDefinition(key)?.name ?? "Unknown",
        namespace: getIprDefinition(key)?.namespace ?? "Unknown",
        count: value,
        totalCount: data.iprTrust!.totalItems,
    }
}));

const filteredItems = computed(() => {
    if (selectedNamespace.value === "all") {
        return items.value;
    }

    return items.value.filter(x => x.namespace === selectedNamespace.value);
});

const downloadItem = (item: IprResultsTableItem) => {
    emits('downloadItem', item);
}

const downloadTable = (items: IprResultsTableItem[]) => {
    emits('downloadTable', items);
}

const analysisStore = computed(() => ({
    status: analysis?.interproFunctionalAnalysisStore?.status,
    termsToConfidence: analysis?.interproFunctionalAnalysisStore?.iprTermsToConfidence,
    analysisStarted: analysis?.interproFunctionalAnalysisStore?.analysisStarted,
    analysisInitializationFinished: analysis?.interproFunctionalAnalysisStore?.analysisInitializationFinished,
    currentProgress: analysis?.interproFunctionalAnalysisStore?.currentProgress,
    etaSeconds: analysis?.interproFunctionalAnalysisStore?.etaSeconds,
    analysisError: analysis?.interproFunctionalAnalysisStore?.analysisError
}));

const resolveName = (term: string) => getIprDefinition(term)?.name || "";
</script>

<script lang="ts">
const namespaces = [
    "all",
    "active site",
    "binding site",
    "conserved site",
    "domain",
    "family",
    "homologous superfamily",
    "ptm",
    "repeat",
    "unknown"
];
</script>

<style scoped>

</style>

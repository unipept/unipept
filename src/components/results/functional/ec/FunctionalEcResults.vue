<script setup lang="ts">
import EcResultsTable from "@/components/results/functional/ec/EcResultsTable.vue";
import {computed, onMounted, ref, watch} from "vue";
import useOntologyStore from "@/store/OntologyStore";
import FilterProgress from "@/components/results/functional/FilterProgress.vue";
import useEcTreeProcessor from "@/composables/processing/functional/useEcTreeProcessor";
import Treeview from "@/components/results/taxonomic/Treeview.vue";
import EcTableData from "@/components/results/functional/ec/EcTableData";
import {EcResultsTableItem} from "@/components/results/functional/ec/EcResultsTable.vue"
import {GoResultsTableItem} from "@/components/results/functional/go/GoResultsTable.vue";
import ECFunctionalAnalysisResults from "@/components/results/functional/ec/ECFunctionalAnalysisResults.vue";

const { getEcDefinition } = useOntologyStore();
const { root, process } = useEcTreeProcessor();

const { data, showDownloadItem = true, analysis = undefined } = defineProps<{
    data: EcTableData;
    loading: boolean;
    showPercentage: boolean;
    showDownloadItem?: boolean;
    analysis?: any;
}>();

const emits = defineEmits<{
    (e: 'downloadItem', item: EcResultsTableItem): void;
    (e: 'downloadTable', item: EcResultsTableItem[]): void;
}>();

const items = computed(() => Array.from(data.ecTable!.counts.entries()).map(([key, value]) => {
    return {
        code: key,
        name: getEcDefinition(key)?.name ?? "Unknown",
        namespace: getEcDefinition(key)?.namespace ?? "Unknown",
        count: value,
        totalCount: data.ecTrust!.totalItems,
    }
}));

const downloadItem = (item: GoResultsTableItem) => {
    emits('downloadItem', item);
}

const downloadTable = (items: EcResultsTableItem[]) => {
    emits('downloadTable', items);
}

watch(() => data, () => {
    process(data.ecTable!);
});

onMounted(() => {
    process(data.ecTable!);
});
</script>

<template>
    <div v-if="!loading">
        <v-row>
            <v-col>
                <slot name="trust" />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <ec-results-table
                    :items="items"
                    :data="data"
                    :show-percentage="showPercentage"
                    :show-download-item="showDownloadItem"
                    @download-item="downloadItem"
                    @download-table="downloadTable"
                />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-card
                    class="pa-0 ma-0"
                    height="400"
                    variant="flat"
                >
                    <treeview
                        v-if="root"
                        :ncbi-root="root"
                    />
                </v-card>
            </v-col>
        </v-row>

        <v-row v-if="analysis && analysis.ecFunctionalAnalysisStore">
            <v-col cols="12">
                <ECFunctionalAnalysisResults
                    :store="analysis.ecFunctionalAnalysisStore"
                    :peptideCountTable="data.ecTable"
                    :peptidesFunctions="analysis.peptidesFunctions"
                />
            </v-col>
        </v-row>
    </div>
    <div v-else>
        <filter-progress text="The EC numbers are currently being filtered." />
    </div>
</template>

<style scoped>

</style>

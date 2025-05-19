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
            <v-col cols="9">
                <go-results-table
                    :items="biologicalProcessItems"
                    :data="data"
                    :show-percentage="showPercentage"
                    :show-download-item="showDownloadItem"
                    @download-item="downloadItem"
                    @download-table="downloadTable"
                />
            </v-col>
            <v-col cols="3">
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
            <v-col cols="9">
                <go-results-table
                    :items="cellularComponentItems"
                    :data="data"
                    :show-percentage="showPercentage"
                    :show-download-item="showDownloadItem"
                    @download-item="downloadItem"
                    @download-table="downloadTable"
                />
            </v-col>
            <v-col cols="3">
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
            <v-col cols="9">
                <go-results-table
                    :items="molecularFunctionItems"
                    :data="data"
                    :show-percentage="showPercentage"
                    :show-download-item="showDownloadItem"
                    @download-item="downloadItem"
                    @download-table="downloadTable"
                />
            </v-col>
            <v-col cols="3">
                <quick-go-card
                    :items="molecularFunctionItems"
                    :namespace="GoNamespace.MolecularFunction"
                    :n="3"
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

const { getGoDefinition } = useOntologyStore();

const { data, loading, showDownloadItem = true } = defineProps<{
    data: GoTableData;
    loading: boolean;
    showPercentage: boolean;
    showDownloadItem?: boolean;
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
</script>

<style scoped>

</style>

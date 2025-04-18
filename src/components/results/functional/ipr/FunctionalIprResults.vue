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

const { getIprDefinition } = useOntologyStore();

const { data, showDownloadItem = true } = defineProps<{
    data: InterproTableData;
    loading: boolean;
    showPercentage: boolean;
    showDownloadItem?: boolean;
}>();

const emits = defineEmits<{
    (e: 'downloadItem', item: IprResultsTableItem): void;
    (e: 'downloadTable', items: IprResultsTableItem[]): void;
}>();

const selectedNamespace = ref<string>("all");

const items = computed(() => Array.from(data.iprTable!.entries()).map(([key, value]) => {
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

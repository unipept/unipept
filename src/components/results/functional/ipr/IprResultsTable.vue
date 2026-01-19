<template>
    <v-data-table
        v-model:expanded="expanded"
        v-model:sort-by="sortBy"
        :items="items"
        :headers="headers"
        :items-per-page="10"
        :loading="false"
        item-value="code"
        density="compact"
        :show-expand="data.ncbiTree !== undefined"
        @update:expanded="singleExpand"
        mobile-breakpoint="md"
    >
        <template #header.action>
            <v-tooltip v-if="!$vuetify.display.mobile" text="Download table as CSV">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        color="primary"
                        density="compact"
                        variant="text"
                        icon="mdi-download"
                        @click="downloadTable"
                    />
                </template>
            </v-tooltip>
            <div v-else>
                Download
            </div>
        </template>

        <template #item.count="{ item }">
            <div
                :style="{
                    padding: '8px 12px',
                    background: `linear-gradient(90deg, rgb(221, 221, 221) 0%, rgb(221, 221, 221) ${(item.count / item.totalCount) * 100}%, rgb(240, 240, 240) ${(item.count / item.totalCount) * 100}%, rgb(240, 240, 240) 100%)`,
                }"
            >
                {{ showPercentage ? displayPercentage(item.count / item.totalCount) : item.count }}
            </div>
        </template>

        <template #item.code="{ item }">
            <a
                :href="url(item.code)"
                target="_blank"
                class="font-regular d-flex align-center"
            >
                {{ item.code.replace(":IPR", ":") }}
                <v-icon
                    size="x-small"
                    class="ml-1"
                >mdi-open-in-new</v-icon>
            </a>
        </template>

        <template
            v-if="showDownloadItem"
            #item.action="{ item }"
        >
            <v-tooltip text="Download CSV summary of the filtered functional annotation">
                <template #activator="{ props }">
                    <v-btn
                        v-if="$vuetify.display.mobile"
                        v-bind="props"
                        color="primary"
                        density="compact"
                        variant="tonal"
                        prepend-icon="mdi-download"
                        text="CSV"
                        class="w-100"
                        style="height: 32px;"
                        @click="downloadItem(item)"
                    />
                    <v-btn
                        v-else
                        v-bind="props"
                        color="primary"
                        density="compact"
                        variant="text"
                        icon="mdi-download"
                        @click="downloadItem(item)"
                    />
                </template>
            </v-tooltip>
        </template>

        <template #expanded-row="{ columns, item }">
            <tr>
                <td :colspan="columns.length">
                    <v-card
                        height="300"
                        variant="flat"
                    >
                        <treeview
                            v-if="trees.has(item.code)"
                            :ncbi-root="trees.get(item.code)!"
                            :link-stroke-color="linkStrokeColor"
                            :node-stroke-color="highlightColorFunc"
                            :node-fill-color="highlightColorFunc"
                        />
                    </v-card>
                </td>
            </tr>
        </template>
    </v-data-table>
</template>

<script setup lang="ts">
import {ref, watch, toRaw, Ref} from "vue";
import usePercentage from "@/composables/usePercentage";
import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import useHighlightedTreeProcessor from "@/composables/processing/taxonomic/useHighlightedTreeProcessor";
import Treeview from "@/components/results/taxonomic/Treeview.vue";
import useCsvDownload from "@/composables/useCsvDownload";
import useOntologyStore from "@/store/OntologyStore";
import InterproTableData from "@/components/results/functional/ipr/InterproTableData";
import {DataNodeLike} from "unipept-visualizations";
import {SortItem} from "vuetify/lib/components/VDataTable/composables/sort";
import type { DataTableHeader } from "vuetify";

const { displayPercentage } = usePercentage();
const { process: processHighlightedTree } = useHighlightedTreeProcessor();

const { data, items } = defineProps<{
    items: IprResultsTableItem[];
    data: InterproTableData;
    showPercentage: boolean;
    showDownloadItem: boolean;
}>();

const emits = defineEmits<{
    (e: 'downloadItem', item: IprResultsTableItem): void;
    (e: 'downloadTable', items: IprResultsTableItem[]): void;
}>();

const expanded = ref<string[]>([]);
const trees = new Map<string, DataNodeLike>();

const calculateHighlightedNcbiTree = async (code: string) => {
    const highlightedTreeRoot = await processHighlightedTree(
        toRaw(data.ncbiTree!),
        toRaw(data.iprToPeptides.get(code)!),
        toRaw(data.lcaToPeptides!)
    );

    trees.set(code, highlightedTreeRoot);
}

const singleExpand = async (value: string[]) => {
    if (value.length === 0) {
        expanded.value = [];
        return;
    }

    const newValue = value[value.length - 1];

    if (!trees.has(newValue)) {
        await calculateHighlightedNcbiTree(newValue);
    }

    expanded.value = [ newValue ];
}

const downloadItem = (item: IprResultsTableItem) => {
    emits("downloadItem", item);
}

const downloadTable = () => {
    emits("downloadTable", items);
}

watch(() => data, () => {
    expanded.value = [];
    trees.clear();
});

const headers: DataTableHeader[] = [
    {
        title: "Peptides",
        align: "start",
        key: "count",
        width: "15%"
    },
    {
        title: "InterPro-entry",
        align: "start",
        key: "code",
        width: "23%"
    },
    {
        title: "Name",
        align: "start",
        key: "name",
        width: "40%"
    },
    {
        title: "Namespace",
        align: "start",
        key: "namespace",
        width: "20%"
    },
    {
        title: "",
        align: "center",
        key: "action",
        width: "2%",
        sortable: false
    }
];

const sortBy: Ref<SortItem[]> = ref([{ key: 'count', order: 'desc' }]);

export interface IprResultsTableItem {
    code: string;
    name: string;
    namespace: string;
    count: number;
    totalCount: number;
}

const url = (code: string) => {
    return `https://www.ebi.ac.uk/interpro/search/text/${code.substring(4)}/#table`;
}

const highlightColor = "#ffc107";
const highlightColorFunc = (d: any) => d.extra.included ? highlightColor : "lightgrey";
const linkStrokeColor = ({ target: d }: any) => highlightColorFunc(d.data);
</script>

<style scoped>
a {
    color: #2196f3;
    text-decoration: none;
}

a:hover {
    text-decoration: none;
}
</style>

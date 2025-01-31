<template>
    <v-data-table
        v-model:expanded="expanded"
        :items="items"
        :headers="headers"
        :items-per-page="10"
        :loading="false"
        item-value="code"
        :show-expand="data.ncbiTree !== undefined"
        @update:expanded="singleExpand"
    >
        <template #header.action>
            <v-tooltip text="Download table as CSV">
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
        </template>

        <template #item.count="{ item }">
            <div
                :style="{
                    padding: '12px',
                    background: 'linear-gradient(90deg, rgb(221, 221, 221) 0%, rgb(221, 221, 221) ' +
                        (item.count / item.totalCount) * 100 + '%, rgba(255,255,255,0) ' + (item.count / item.totalCount) * 100 + '%)',
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
import {ref, watch, toRaw} from "vue";
import usePercentage from "@/composables/usePercentage";
import {NcbiTreeNode} from "unipept-web-components";
import useHighlightedTreeProcessor from "@/composables/processing/taxonomic/useHighlightedTreeProcessor";
import Treeview from "@/components/results/taxonomic/Treeview.vue";
import useCsvDownload from "@/composables/useCsvDownload";
import useOntologyStore from "@/store/new/OntologyStore";
import InterproTableData from "@/components/results/functional/ipr/InterproTableData";
import {DataNodeLike} from "unipept-visualizations";

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

// TODO remove the any type annotation when Vuetify properly exports DataTableHeader types
const headers: any = [
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
]

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

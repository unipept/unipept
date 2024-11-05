<template>
    <v-data-table
        v-model:expanded="expanded"
        :items="items"
        :headers="headers"
        :items-per-page="10"
        :loading="false"
        item-value="code"
        density="compact"
        show-expand
        @update:expanded="singleExpand"
    >
        <template #item.count="{ item }">
            <span>{{ showPercentage ? displayPercentage(item.count / item.totalCount) : item.count }}</span>
        </template>

        <template #item.code="{ item }">
            <a
                :href="url(item.code)"
                target="_blank"
                class="font-regular"
            >
                {{ item.code }}
                <v-icon size="x-small">mdi-open-in-new</v-icon>
            </a>
        </template>

        <template #item.action="{ index }">
            <v-btn
                color="primary"
                density="compact"
                variant="text"
                icon="mdi-download"
                @click="downloadItem(index)"
            />
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
                            :ncbi-root="trees.get(item.code)"
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
import {ref, toRaw, watch} from "vue";
import usePercentage from "@/composables/new/usePercentage";
import {NcbiTreeNode} from "unipept-web-components";
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import useHighlightedTreeProcessor from "@/composables/new/processing/taxonomic/useHighlightedTreeProcessor";
import Treeview from "@/components/new/results/taxonomic/Treeview.vue";

const { displayPercentage } = usePercentage();
const { process: processHighlightedTree } = useHighlightedTreeProcessor();

const { analysis } = defineProps<{
    items: IprResultsTableItem[];
    analysis: SingleAnalysisStore;
    showPercentage: boolean;
}>();

const expanded = ref<number[]>([]);
const trees = new Map<string, NcbiTreeNode>();

const calculateHighlightedNcbiTree = async (code: string) => {
    const highlightedTreeRoot = await processHighlightedTree(
        toRaw(analysis.ncbiTree),
        toRaw(analysis.iprToPeptides.get(code)),
        toRaw(analysis.lcaToPeptides)
    );

    trees.set(code, highlightedTreeRoot);
}

const singleExpand = async (value: number[]) => {
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

const downloadItem = (index: number) => {
    console.log("Download item", index);
}

watch(() => analysis, () => {
    expanded.value = [];
    trees.clear();
});
</script>

<script lang="ts">
const headers = [
    {
        title: "Peptides",
        align: "start",
        key: "count",
        width: "15%"
    },
    {
        title: "EC-number",
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

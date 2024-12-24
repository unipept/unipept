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
            <span>{{ showPercentage ? displayPercentage(item.count / item.totalCount) : item.count }}</span>
        </template>

        <template #item.code="{ item }">
            <a
                :href="url(item.code)"
                target="_blank"
                class="font-regular d-flex align-center"
            >
                {{ item.code.replace(":IPR", ":") }}
                <v-icon size="x-small" class="ml-1">mdi-open-in-new</v-icon>
            </a>
        </template>

        <template #item.action="{ item }">
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
import useCsvDownload from "@/composables/new/useCsvDownload";
import useOntologyStore from "@/store/new/OntologyStore";

const { download } = useCsvDownload();
const { displayPercentage } = usePercentage();
const { getNcbiDefinition } = useOntologyStore();
const { process: processHighlightedTree } = useHighlightedTreeProcessor();

const { analysis, items } = defineProps<{
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

const downloadItem = (item: IprResultsTableItem) => {
    const header = ["peptide", "spectral count", "matching proteins", `matching proteins with ${item.code}`, `percentage proteins with ${item.code}`, "lca"];
    const data = [header].concat(Array.from(analysis.iprToPeptides.get(item.code)).map(peptide => {
        const peptideData = analysis.peptideToData.get(peptide);
        const totalProteinCount = peptideData.faCounts.all;
        const itemProteinCount = peptideData.ipr[item.code] ?? 0;
        return [
            peptide,
            analysis.peptidesTable.get(peptide),
            totalProteinCount,
            itemProteinCount,
            displayPercentage(itemProteinCount / totalProteinCount, Infinity),
            getNcbiDefinition(peptideData.lca)?.name ?? "Unknown"
        ];
    }));

    download(data, `${item.code.replace(":", "_")}.csv`);
}

const downloadTable = () => {
    const header = ["peptides", "interpro entry", "name"]
    const data = [header].concat(items.map(item => {
        return [
            item.count,
            item.code,
            item.name
        ];
    }));

    download(data, "interpro_table.csv");
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

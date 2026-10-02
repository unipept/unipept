<template>
    <div>
        <v-data-table
            v-model:expanded="expanded"
            v-model:sort-by="sortBy"
            :items="filteredItems"
            :headers="headers"
            :items-per-page="5"
            :loading="false"
            must-sort
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

            <template #header.confidence="{ column, getSortIcon }">
                <div
                    class="v-data-table-header__content"
                    style="white-space: nowrap;"
                >
                    <span>{{ column.title }}</span>
                    <!-- While the scores are computed, the spinner takes the place of the info icon so the header keeps its width -->
                    <v-tooltip :text="scoresLoading ? 'Computing NORI scores...' : `Score from NORI: a higher score means this EC number is more likely correct. — means not scored (only the top ${maxScoredAnnotations} annotations get a score).`">
                        <template #activator="{ props }">
                            <v-progress-circular
                                v-if="scoresLoading"
                                v-bind="props"
                                indeterminate
                                size="12"
                                width="2"
                                color="primary"
                                class="ml-1"
                            />
                            <v-icon
                                v-else
                                v-bind="props"
                                size="x-small"
                                class="ml-1"
                            >
                                mdi-information-outline
                            </v-icon>
                        </template>
                    </v-tooltip>
                    <v-icon
                        class="v-data-table-header__sort-icon"
                        :icon="getSortIcon(column)"
                    />
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
                    {{ item.code }}
                    <v-icon
                        size="x-small"
                        class="ml-1"
                    >mdi-open-in-new</v-icon>
                </a>
            </template>

            <template #item.confidence="{ item }">
                <div
                    v-if="scoresLoading"
                    style="padding: 8px 12px;"
                >
                    <div class="score-placeholder" />
                </div>
                <div
                    v-else-if="item.confidence !== undefined"
                    :style="{
                        padding: '8px 12px',
                        background: `linear-gradient(90deg, rgba(25, 118, 210, 0.35) 0%, rgba(25, 118, 210, 0.35) ${item.confidence * 100}%, rgb(240, 240, 240) ${item.confidence * 100}%, rgb(240, 240, 240) 100%)`,
                    }"
                >
                    {{ item.confidence.toFixed(2) }}
                </div>
                <v-tooltip
                    v-else
                    text="Not scored by NORI"
                >
                    <template #activator="{ props }">
                        <span
                            v-bind="props"
                            class="text-disabled"
                            style="padding: 8px 12px;"
                        >
                            &mdash;
                        </span>
                    </template>
                </v-tooltip>
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
    </div>
</template>

<script setup lang="ts">
import {computed, Ref, ref, toRaw, watch} from "vue";
import usePercentage from "@/composables/usePercentage";
import {MAX_SCORED_ANNOTATIONS as maxScoredAnnotations} from "@/logic/processors/functional/FunctionalAnalysisProcessor";
import Treeview from "@/components/results/taxonomic/Treeview.vue";
import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import useHighlightedTreeProcessor from "@/composables/processing/taxonomic/useHighlightedTreeProcessor";
import EcTableData from "@/components/results/functional/ec/EcTableData";
import type {DataTableSortItem as SortItem, DataTableHeader} from "vuetify";

const { displayPercentage } = usePercentage();
const { process: processHighlightedTree } = useHighlightedTreeProcessor();

const { data, items, probabilityThreshold = 0, scoresLoading = false } = defineProps<{
    items: EcResultsTableItem[];
    data: EcTableData;
    showPercentage: boolean;
    showDownloadItem: boolean;
    probabilityThreshold?: number;
    scoresLoading?: boolean;
}>();

const emits = defineEmits<{
    (e: 'downloadItem', item: EcResultsTableItem): void;
    (e: 'downloadTable', item: EcResultsTableItem[]): void;
}>();

const expanded = ref<string[]>([]);
const trees = new Map<string, NcbiTreeNode>();

const filteredItems = computed(() => {
    // Do not hide annotations based on their score while the scores are still being computed
    if (scoresLoading) {
        return items;
    }

    return items.filter(item => (item.confidence ?? 0) >= probabilityThreshold);
});

const calculateHighlightedNcbiTree = async (code: string) => {
    const highlightedTreeRoot = await processHighlightedTree(
        toRaw(data.ncbiTree!),
        toRaw(data.ecToPeptides.get(code)!),
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

const downloadItem = (item: EcResultsTableItem) => {
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
        width: "20%"
    },
    {
        title: "NORI score",
        align: "start",
        key: "confidence",
        // Annotations without a score are sorted below all scored annotations
        sort: (a?: number, b?: number) => (a ?? -1) - (b ?? -1),
        width: "12%",
        minWidth: "140px"
    },
    {
        title: "EC-number",
        align: "start",
        key: "code",
        width: "30%"
    },
    {
        title: "Name",
        align: "start",
        key: "name",
        width: "35%"
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

export interface EcResultsTableItem {
    code: string;
    name: string;
    count: number;
    totalCount: number;
    confidence?: number;
}

const url = (code: string) => {
    return `https://www.uniprot.org/uniprot/?query=${code}`;
}

const highlightColor = "#ffc107";
const highlightColorFunc = (d: any) => d.extra.included ? highlightColor : "lightgrey";
const linkStrokeColor = ({ target: d }: any) => highlightColorFunc(d.data);
</script>

<style scoped>
.score-placeholder {
    width: 48px;
    height: 8px;
    border-radius: 4px;
    background: rgba(var(--v-theme-on-surface), 0.08);
}

a {
    color: #2196f3;
    text-decoration: none;
}

a:hover {
    text-decoration: none;
}
</style>

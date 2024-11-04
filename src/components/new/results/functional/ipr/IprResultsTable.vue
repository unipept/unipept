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

        <template #expanded-row="{ columns }">
            <tr>
                <td :colspan="columns.length">
                    AAAAA
                </td>
            </tr>
        </template>
    </v-data-table>
</template>

<script setup lang="ts">
import {ref} from "vue";
import usePercentage from "@/composables/new/usePercentage";

const { displayPercentage } = usePercentage();

defineProps<{
    items: IprResultsTableItem[];
    showPercentage: boolean;
}>();

const expanded = ref<number[]>([]);

const url = (code: string) => {
    return `https://www.ebi.ac.uk/interpro/search/text/${code.substring(4)}/#table`;
}

const downloadItem = (index: number) => {
    console.log("Download item", index);
}
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

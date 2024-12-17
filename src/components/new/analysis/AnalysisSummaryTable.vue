<template>
    <v-data-table
        :headers="headers"
        :items="items"
        :items-per-page="5"
        :loading="false"
        density="compact"
    >
        <template #no-data>
            <v-alert class="ma-3" density="compact" type="info" variant="tonal" text="No peptides found" />
        </template>

        <template #item.peptide="{ item }">
            <a
                class="cursor-pointer"
                @click="openPeptideAnalysis(item.peptide)"
            >
                {{ item.peptide }}
            </a>
        </template>

        <template #item.warning="{ item }">
            <v-tooltip
                v-if="!item.found"
                text="This peptide was not found by Unipept"
            >
                <template #activator="{ props }">
                    <v-icon
                        v-if="!item.found"
                        v-bind="props"
                        color="warning"
                        size="20"
                        icon="mdi-alert-circle-outline"
                    />
                </template>
            </v-tooltip>
        </template>
    </v-data-table>
</template>

<script setup lang="ts">
defineProps<{
    items: AnalysisSummaryTableItem[]
}>();
</script>

<script lang="ts">
const headers = [
    {
        title: "Peptide",
        align: "start",
        key: "peptide",
    },
    {
        title: "Occurrence",
        align: "start",
        key: "occurrence",
    },
    {
        title: "Lowest common ancestor",
        align: "start",
        key: "lca"
    },
    {
        title: "Rank",
        align: "start",
        key: "rank"
    },
    {
        title: "",
        align: "start",
        key: "warning",
        sortable: false
    }
];

export interface AnalysisSummaryTableItem {
    peptide: string;
    occurrence: number;
    lca: string;
    rank: string;
    found: boolean;
}

const openPeptideAnalysis = (peptide: string) => {
    // TODO: change this. Hardcoded link to website for testing purposes
    const a = document.createElement('a');
    a.href = `https://unipept.ugent.be/tpa/${peptide}?equate=${true}`;
    a.target = '_blank';
    a.click();
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

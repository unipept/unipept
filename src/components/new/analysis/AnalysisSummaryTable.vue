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
</script>

<style scoped>

</style>

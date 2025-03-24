<template>
    <v-data-table
        :headers="headers"
        :items="items"
        :items-per-page="5"
        :loading="false"
        density="compact"
        style="background-color: transparent"
    >
        <template #no-data>
            <v-alert
                class="ma-3"
                density="compact"
                type="info"
                variant="tonal"
                text="No peptides found"
            />
        </template>

        <template #item.peptide="{ item }">
            <a
                class="cursor-pointer"
                @click="openPeptideAnalysis(item.peptide)"
            >
                {{ item.peptide }}
            </a>
        </template>

        <template #item.faCounts="{ item }">
            <v-tooltip v-if="item.faCounts" location="top">
                <template #activator="{ props }">
                    <v-avatar
                        v-bind="props"
                        size="30"
                        :color="item.faCounts.go > 0 ? 'amber' : 'amber-lighten-4'"
                        class="me-1"
                    >
                        <span
                            :class="[ item.faCounts.go > 0 ? 'dark--text' : 'gray--text', 'headline']"
                            style="font-size: 14px !important;"
                        >
                            GO
                        </span>
                    </v-avatar>
                </template>

                <span v-if="item.faCounts.go > 0">
                    This peptide is annotated with {{ item.faCounts.go }}
                    <span class="font-weight-bold">
                        {{ item.faCounts.go === 1 ? "GO-term" : "GO-terms" }}.
                    </span>
                </span>

                <span v-else>
                    This peptide is not annotated with GO-terms.
                </span>
            </v-tooltip>

            <v-tooltip v-if="item.faCounts" location="top">
                <template #activator="{ props }">
                    <v-avatar
                        v-bind="props"
                        size="30"
                        :color="item.faCounts.ec > 0 ? 'indigo' : 'indigo-lighten-4'"
                        class="me-1"
                    >
                        <span
                            class="text-white"
                            style="font-size: 14px !important;"
                        >
                            EC
                        </span>
                    </v-avatar>
                </template>

                <span v-if="item.faCounts.ec > 0">
                    This peptide is annotated with {{ item.faCounts.ec }}
                    <span class="font-weight-bold">
                        {{ item.faCounts.ec === 1 ? "EC-number" : "EC-numbers" }}.
                    </span>
                </span>

                <span v-else>
                    This peptide is not annotated with EC-numbers.
                </span>
            </v-tooltip>

            <v-tooltip v-if="item.faCounts" location="top">
                <template #activator="{ props }">
                    <v-avatar
                        v-bind="props"
                        size="30"
                        :color="item.faCounts.ipr > 0 ? 'red' : 'red-lighten-4'"
                    >
                        <span
                            class="text-white"
                            style="font-size: 14px !important;"
                        >
                            IPR
                        </span>
                    </v-avatar>
                </template>

                <span v-if="item.faCounts.ipr > 0">
                    This peptide is annotated with {{ item.faCounts.ipr }}
                    <span class="font-weight-bold">
                        {{ item.faCounts.ipr === 1 ? "InterPro-entry" : "InterPro-entries" }}.
                    </span>
                </span>

                <span v-else>
                    This protein is not annotated with InterPro-entries.
                </span>
            </v-tooltip>
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
// Need to cast to any until Vuetify correctly exposes TableHeaderItems
const headers: any = [
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
        title: "Annotations",
        align: "start",
        key: "faCounts",
        sortable: false
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
    faCounts: { all: number, ec: number, go: number, ipr: number } | undefined;
}

const openPeptideAnalysis = (peptide: string) => {
    // TODO: change this. Hardcoded link to website for testing purposes
    const a = document.createElement('a');
    a.href = `https://unipept.ugent.be/spa/${peptide}?equate=${true}`;
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

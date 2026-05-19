<template>
    <v-data-table-server
        mobile-breakpoint="md"
        :headers="headers"
        :items="shownItems"
        :items-per-page="5"
        :items-length="analysis.peptidesTable!.totalCount"
        density="compact"
        :disable-sort="true"
        style="background-color: transparent"
        @update:options="computeShownItems"
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
            <v-tooltip location="top" :text="item.peptide">
                <template #activator="{ props }">
                    <a
                        v-bind="props"
                        class="cursor-pointer"
                        style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                        @click="openPeptideAnalysis(item.peptide)"
                    >
                        {{ item.peptide }}
                    </a>
                </template>
            </v-tooltip>
        </template>

        <template #item.lca="{ item }">
            <v-tooltip location="top" :text="item.lca">
                <template #activator="{ props }">
                    <span
                        v-bind="props"
                        style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                    >
                        {{ item.lca }}
                    </span>
                </template>
            </v-tooltip>
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
                            :class="[ item.faCounts.go > 0 ? 'text-black' : 'text-grey', 'headline']"
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

        <template #item.status="{ item }">
            <v-tooltip location="top">
                <template #activator="{ props }">
                    <v-avatar
                        v-bind="props"
                        size="30"
                        color="transparent"
                        :style="item.found ? 'border: 2px solid rgb(var(--v-theme-success));' : 'border: 2px solid #C8E6C9;'"
                        class="me-1"
                    >
                        <v-icon
                            size="18"
                            :class="item.found ? 'text-success' : 'text-green-lighten-4'"
                            :icon="item.found ? 'mdi-database' : 'mdi-database-alert'"
                        />
                    </v-avatar>
                </template>
                <span v-if="item.found">Peptide was found by Unipept.</span>
                <span v-else>This peptide was not found by Unipept.</span>
            </v-tooltip>

            <v-tooltip location="top">
                <template #activator="{ props }">
                    <v-avatar
                        v-bind="props"
                        size="30"
                        color="transparent"
                        :style="item.cutoffUsed ? 'border: 2px solid #FFC107;' : 'border: 2px solid #FFECB3;'"
                        class="me-1"
                    >
                        <v-icon
                            size="18"
                            :class="item.cutoffUsed ? 'text-amber' : 'text-amber-lighten-4'"
                            :icon="item.cutoffUsed ? 'mdi-gauge-full' : 'mdi-gauge-low'"
                        />
                    </v-avatar>
                </template>
                <div style="max-width: 500px">
                    <span v-if="item.cutoffUsed">
                        Protein match cutoff exceeded for this peptide. Results are based on a subset of matching proteins and may not be fully representative.
                    </span>
                    <span v-else>Protein match cutoff not exceeded for this peptide. All matching proteins were included for the analysis of this peptide.</span>
                </div>
            </v-tooltip>

            <v-tooltip location="top">
                <template #activator="{ props }">
                    <v-avatar
                        v-bind="props"
                        size="30"
                        color="transparent"
                        :style="item.crapFiltered ? 'border: 2px solid #F44336;' : 'border: 2px solid #FFCDD2;'"
                    >
                        <v-icon
                            size="18"
                            :class="item.crapFiltered ? 'text-red' : 'text-red-lighten-4'"
                            :icon="item.crapFiltered ? 'mdi-filter-minus' : 'mdi-filter'"
                        />
                    </v-avatar>
                </template>
                <span v-if="item.crapFiltered">This peptide was filtered out by the cRAP filter and excluded from the analysis.</span>
                <span v-else>This peptide was not filtered by the cRAP filter.</span>
            </v-tooltip>
        </template>
    </v-data-table-server>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import useOntologyStore from "@/store/OntologyStore";

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore
}>();

const shownItems = ref<AnalysisSummaryTableItem[]>([]);

const { getNcbiDefinition } = useOntologyStore();

const computeShownItems = (params: ConfigParams) => {
    let itemsPerPage = params.itemsPerPage;
    // Check if we need to show all items
    if (params.itemsPerPage === -1) {
        itemsPerPage = analysis.peptidesTable!.totalCount;
    }

    shownItems.value = analysis.peptidesTable!
        .getEntriesRange(
            (params.page - 1) * itemsPerPage,
            params.page * itemsPerPage
        )
        .map(([peptide, count]) => {
            const lca = analysis.peptideToLca!.get(peptide)!;
            return {
                peptide: peptide,
                occurrence: count,
                lca: getNcbiDefinition(lca)?.name ?? "N/A",
                rank: getNcbiDefinition(lca)?.rank ?? "N/A",
                found: analysis.peptideToLca!.has(peptide),
                faCounts: analysis.peptideToData!.get(peptide)?.faCounts,
                cutoffUsed: analysis.peptideToData!.get(peptide)?.cutoffUsed ?? false,
                crapFiltered: analysis.peptideToData!.get(peptide)?.crapFiltered ?? false
            };
        });
}

watch(() => analysis, () => computeShownItems({
    page: 1,
    itemsPerPage: 5,
    sortBy: []
}));
</script>

<script lang="ts">
import type { DataTableHeader } from "vuetify";

const headers: DataTableHeader[] = [
    {
        title: "Peptide",
        align: "start",
        key: "peptide",
        width: "25%",
        maxWidth: "25%",
        cellProps: { style: "max-width: 0; overflow: hidden;" }
    },
    {
        title: "Occurrence",
        align: "start",
        key: "occurrence",
        width: "10%"
    },
    {
        title: "Lowest common ancestor",
        align: "start",
        key: "lca",
        width: "25%",
        maxWidth: "25%",
        cellProps: { style: "max-width: 0; overflow: hidden;" }
    },
    {
        title: "Rank",
        align: "start",
        key: "rank",
        width: "15%"
    },
    {
        title: "Annotations",
        align: "start",
        key: "faCounts",
        width: "15%"
    },
    {
        title: "Status",
        align: "center",
        key: "status",
        width: "10%"
    }
];

export interface AnalysisSummaryTableItem {
    peptide: string;
    occurrence: number;
    lca: string;
    rank: string;
    found: boolean;
    faCounts: { all: number, ec: number, go: number, ipr: number } | undefined;
    cutoffUsed: boolean;
    crapFiltered: boolean;
}

interface ConfigParams {
    page: number;
    itemsPerPage: number;
    sortBy: { key: string, order: "asc" | "desc" }[];
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

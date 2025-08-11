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
            <a
                class="cursor-pointer"
                @click="openPeptideAnalysis(item.peptide)"
                :style="$vuetify.display.mobile ? 'display: inline-block; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;' : ''"
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
    shownItems.value = analysis.peptidesTable!
        .getEntriesRange(
            (params.page - 1) * params.itemsPerPage,
            params.page * params.itemsPerPage
        )
        .map(([peptide, count]) => {
            const lca = analysis.peptideToLca!.get(peptide)!;
            return {
                peptide: peptide,
                occurrence: count,
                lca: getNcbiDefinition(lca)?.name ?? "N/A",
                rank: getNcbiDefinition(lca)?.rank ?? "N/A",
                found: analysis.peptideToLca!.has(peptide),
                faCounts: analysis.peptideToData!.get(peptide)?.faCounts
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
// Need to cast to any until Vuetify correctly exposes TableHeaderItems
const headers: any = [
    {
        title: "Peptide",
        align: "start",
        key: "peptide",
        width: "25%"
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
        width: "30%"
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
        title: "",
        align: "start",
        key: "warning",
        width: "5%"
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

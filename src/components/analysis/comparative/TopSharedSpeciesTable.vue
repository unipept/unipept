<template>
    <v-data-table
        :loading="loading"
        :headers="tableHeaders"
        :items="topTaxa"
        :items-per-page="5"
        :items-per-page-options="[5, 10, 20, -1]"
        :sort-by="sortByItems"
        multi-sort
        density="compact"
    >
        <template #item.name="{ item }">
            <a
                :href="url(item.id)"
                target="_blank"
                class="font-regular d-flex align-center"
            >
                {{ item.name }}
                <v-icon
                    size="x-small"
                    class="ml-1"
                >mdi-open-in-new</v-icon>
            </a>
        </template>
        <template #item.samplesOccurrence="{ item }">
            <span v-for="analysis of selectedAnalyses.slice(0, 4)" :key="analysis.id">
                <v-tooltip v-if="analysis.lcaToPeptides!.has(item.id)" :text="`${item.name} is present in sample ${analysis.name}`">
                    <template v-slot:activator="{ props }">
                        <v-icon color="success" v-bind="props" class="mr-1" style="cursor: pointer;">
                            mdi-check
                        </v-icon>
                    </template>
                </v-tooltip>

                <v-tooltip v-else :text="`${item.name} was not found in sample ${analysis.name}`">
                    <template v-slot:activator="{ props }">
                        <v-icon color="error" v-bind="props" class="mr-1" style="cursor: pointer;">
                            mdi-close
                        </v-icon>
                    </template>
                </v-tooltip>
            </span>
            <span v-if="selectedAnalyses.length > 4">
                <v-tooltip>
                    <template v-slot:activator="{ props }">
                        <v-chip
                            v-bind="props"
                            variant="tonal"
                            density="compact"
                            style="cursor: pointer;"
                        >
                            +{{ selectedAnalyses.length - 4 }}
                        </v-chip>
                    </template>

                    <ul class="pa-0 ma-0"
                        style="list-style-type:none;">
                        <li v-for="analysis of selectedAnalyses.slice(4)" :key="analysis.id">
                            <span v-if="analysis.lcaToPeptides!.has(item.id)">
                                <v-icon color="success" class="mr-1" style="cursor: pointer;">
                                    mdi-check
                                </v-icon>
                                {{ item.name }} is present in sample {{ analysis.name }}
                            </span>

                            <span v-else>
                                <v-icon color="red" class="mr-1" style="cursor: pointer;">
                                    mdi-close
                                </v-icon>
                                {{ item.name }} was not found in sample {{ analysis.name }}
                            </span>
                        </li>
                    </ul>
                </v-tooltip>
            </span>
        </template>

        <template #item.averageAbundance = "{ item }">
            <div
                :style="{
                    padding: '6px 12px',
                    background: `linear-gradient(90deg, rgb(221, 221, 221) 0%, rgb(221, 221, 221) ${item.averageAbundance * 100}%, rgb(240, 240, 240) ${item.averageAbundance * 100}%, rgb(240, 240, 240) 100%)`,
                }"
            >
                {{ (item.averageAbundance * 100).toFixed(2) }}%
            </div>
        </template>
    </v-data-table>
</template>

<script setup lang="ts">
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {onMounted, ref, Ref, shallowRef, watch} from "vue";
import {useDebounceFn} from "@vueuse/core";
import {NcbiRank} from "@/logic/ontology/taxonomic/Ncbi";
import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import {SortItem} from "vuetify/lib/components/VDataTable/composables/sort";
import type { DataTableHeader } from "vuetify";

interface TopTaxon {
    // NcbiID of this taxon
    id: number,
    name: string,
    // In how many of the selected samples does this taxon occur?
    samplesOccurrence: number,
    // What is the average relative abundance of this taxon over all selected samples?
    averageAbundance: number
}

const { selectedAnalyses } = defineProps<{
    selectedAnalyses: SingleAnalysisStore[]
}>();

const tableHeaders: DataTableHeader[] = [
    {
        title: "Name",
        align: "start",
        value: "name",
        width: "40%",
        sortable: true
    },
    {
        title: "Sample matches",
        align: "start",
        value: "samplesOccurrence",
        width: "30%",
        sortable: true
    },
    {
        title: "Avg. relative abundance",
        align: "start",
        value: "averageAbundance",
        width: "40%",
        sortable: true
    }
];

const sortByItems: Ref<SortItem[]> = ref([
    {
        key: 'samplesOccurrence',
        order: 'desc'
    }, {
        key: 'averageAbundance',
        order: 'desc'
    }
]);

const topTaxa: Ref<TopTaxon[]> = shallowRef([]);
const loading: Ref<boolean> = ref(true);

const url = (code: number) => {
    return `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${code}`;
}

const computeMostCommonSharedSpecies = () => {
    loading.value = true;
    // Keep track of the amount of samples this taxon appears in
    const taxonSamplesCount = new Map<number, number>();
    const taxonNameMap = new Map<number, string>();
    const taxonRelativeAbundance = new Map<number, number[]>();

    for (const analysis of selectedAnalyses) {
        let peptidesAtSpeciesLevel = 0;

        // First compute the total peptides at species level
        analysis.ncbiTree.callRecursivelyPostOrder((node: NcbiTreeNode) => {
            const definition = analysis.ontologyStore.getNcbiDefinition(node.id);

            if (definition && definition.rank == NcbiRank.Species) {
                peptidesAtSpeciesLevel += node.count;
            }
        });

        analysis.ncbiTree.callRecursivelyPostOrder((node: NcbiTreeNode) => {
            const definition = analysis.ontologyStore.getNcbiDefinition(node.id);

            if (definition && definition.rank == NcbiRank.Species) {
                if (!taxonSamplesCount.has(definition.id)) {
                    taxonSamplesCount.set(definition.id, 0);
                }
                taxonSamplesCount.set(definition.id, taxonSamplesCount.get(definition.id)! + 1);

                if (!taxonNameMap.has(definition.id)) {
                    taxonNameMap.set(definition.id, definition.name);
                }

                if (!taxonRelativeAbundance.has(definition.id)) {
                    taxonRelativeAbundance.set(definition.id, []);
                }
                taxonRelativeAbundance.get(definition.id)!.push(node.count / peptidesAtSpeciesLevel);
            }
        });
    }
    
    // Extract the 20 taxa from the map for which the count is the highest
    topTaxa.value = Array.from(taxonSamplesCount.entries())
        .sort((a, b) => {
            const occurrenceDiff = b[1] - a[1];
            if (occurrenceDiff !== 0) return occurrenceDiff;

            const aAvg = taxonRelativeAbundance.get(a[0])!.reduce((sum, curr) => sum + curr) / a[1];
            const bAvg = taxonRelativeAbundance.get(b[0])!.reduce((sum, curr) => sum + curr) / b[1];
            return bAvg - aAvg;
        })
        .slice(0, 50)
        .map(([id, occurrence]) => ({
            id,
            name: taxonNameMap.get(id)!,
            samplesOccurrence: occurrence,
            averageAbundance: (taxonRelativeAbundance.get(id)!.reduce((partialSum, current) => partialSum + current) / occurrence)
        }));

    loading.value = false;
};

const debouncedComputeCommonTaxa = useDebounceFn(computeMostCommonSharedSpecies, 100);

onMounted(debouncedComputeCommonTaxa);
watch(() => selectedAnalyses, debouncedComputeCommonTaxa);
</script>

<style scoped>

</style>
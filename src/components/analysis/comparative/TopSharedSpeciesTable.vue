<template>
    <v-data-table
        :loading="loading"
        :headers="tableHeaders"
        :items="topTaxa"
        :items-per-page="5"
        density="compact"
        color="primary"
    />
</template>

<script setup lang="ts">
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {onMounted, ref, Ref, shallowRef, watch} from "vue";
import {useDebounceFn} from "@vueuse/core";
import {NcbiRank, NcbiTaxon} from "@/logic/ontology/taxonomic/Ncbi";
import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";

interface TopTaxon {
    // NcbiID of this taxon
    id: number,
    name: string,
    // In how many of the selected samples does this taxon occur?
    samplesOccurrence: string,
    // What is the average relative abundance of this taxon over all selected samples?
    averageAbundance: string
}

const { selectedAnalyses } = defineProps<{
    selectedAnalyses: SingleAnalysisStore[]
}>();

// @ts-ignore need to annotate headers until Vuetify 3 correctly exposes type of headers
const tableHeaders: any = [
    {
        title: "Name",
        align: "start",
        value: "name",
    },
    {
        title: "Samples",
        align: "start",
        value: "samplesOccurrence"
    },
    {
        title: "Avg. relative abundance",
        align: "start",
        value: "averageAbundance"
    }
]

const topTaxa: Ref<TopTaxon[]> = shallowRef([]);
const loading: Ref<boolean> = ref(true);

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
        .slice(0, 20)
        .map(([id, occurrence]) => ({
            id,
            name: taxonNameMap.get(id)!,
            samplesOccurrence: `${occurrence}/${selectedAnalyses.length}`,
            averageAbundance: `${((taxonRelativeAbundance.get(id)!.reduce((partialSum, current) => partialSum + current) / occurrence) * 100).toFixed(2)}%`
        }));

    loading.value = false;
};

const debouncedComputeCommonTaxa = useDebounceFn(computeMostCommonSharedSpecies, 100);

onMounted(debouncedComputeCommonTaxa);
watch(() => selectedAnalyses, debouncedComputeCommonTaxa);
</script>

<style scoped>

</style>
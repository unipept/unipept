<template>
    <v-unipept-card>
        <v-card-title>
            <span class="text-h4">Comparative analysis</span>
        </v-card-title>
        <v-card-text>
            <h2 class="pb-2">
                Analysis summary
            </h2>
            <v-row>
                <v-col cols="6">
                    <div>
                        <span class="font-weight-bold">{{ selectedAnalyses.length }} {{ selectedAnalyses.length === 1 ? 'sample' : 'samples' }}</span>
                        from {{ totalUniqueGroups }} different {{ totalUniqueGroups === 1 ? 'group' : 'groups' }} selected
                    </div>
                    <div>
                        <span class="font-weight-bold">Total {{ formatNumber(totalPeptides) }} peptides</span>
                        <span>, with {{ formatNumber(matchedPeptides) }} matched</span>
                        <span>
                            (average {{ formatNumber(Math.round(totalPeptides / selectedAnalyses.length)) }} / sample)
                        </span>
                    </div>
                    <div>
                        Average matched peptides: <span class="font-weight-bold">{{ averageMatchedPeptides.toFixed(2) }}%</span>
                    </div>
                </v-col>
                <v-col cols="6">
                    <consistent-setting-check
                        :selected-analyses="selectedAnalyses"
                        :check-test="(s: SingleAnalysisStore) => s.config.equate ? 'enabled' : 'disabled'"
                        check-name="Equate I and L"
                    />

                    <consistent-setting-check
                        :selected-analyses="selectedAnalyses"
                        :check-test="(s: SingleAnalysisStore) => s.config.filter ? 'enabled' : 'disabled'"
                        check-name="Filter duplicates"
                    />

                    <consistent-setting-check
                        :selected-analyses="selectedAnalyses"
                        :check-test="(s: SingleAnalysisStore) => s.config.missed ? 'enabled' : 'disabled'"
                        check-name="Advanced missed cleavage"
                    />

                    <consistent-setting-check
                        :selected-analyses="selectedAnalyses"
                        :check-test="(s: SingleAnalysisStore) => s.databaseVersion"
                        check-name="UniProtKB version"
                    />
                </v-col>
                <!-- Show here whether all selected samples have been analysed using the same settings. -->
            </v-row>

            <v-container fluid class="pa-0 ma-0">
                <v-row>
                    <v-col :cols="12">
                        <h2 class="pb-2">
                            Most common shared species
                        </h2>
                        <top-shared-species-table :selected-analyses="selectedAnalyses" />
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {computed, ComputedRef} from "vue";
import TopSharedSpeciesTable from "@/components/analysis/comparative/TopSharedSpeciesTable.vue";
import ConsistentSettingCheck from "@/components/analysis/comparative/ConsistentSettingCheck.vue";
import {useNumberFormatter} from "@/composables/useNumberFormatter";
import {GroupAnalysisStore} from "@/store/GroupAnalysisStore";

const { groups, selectedAnalyses } = defineProps<{
    selectedAnalyses: SingleAnalysisStore[],
    groups: GroupAnalysisStore[],
}>();

const { formatNumber } = useNumberFormatter();

const totalPeptides: ComputedRef<number> = computed(() => {
    if (!selectedAnalyses || selectedAnalyses.length === 0) {
        return 0;
    }

    return selectedAnalyses.reduce((acc: number, s: SingleAnalysisStore) => acc + s.peptideTrust!.searchedPeptides, 0);
});

const matchedPeptides: ComputedRef<number> = computed(() => {
    if (!selectedAnalyses || selectedAnalyses.length === 0) {
        return 0;
    }

    return selectedAnalyses.reduce((acc: number, s: SingleAnalysisStore) => acc + s.peptideTrust!.matchedPeptides, 0);
});

const averageMatchedPeptides: ComputedRef<number> = computed(() => {
    if (!selectedAnalyses || selectedAnalyses.length === 0) {
        return 0;
    }

    return (selectedAnalyses.map((s) => s.peptideTrust!.matchedPeptides / s.peptideTrust!.searchedPeptides).reduce((acc, curr) => acc + curr, 0) / selectedAnalyses.length) * 100;
});

const totalUniqueGroups: ComputedRef<number> = computed(() => {
    let uniqueGroups: number = 0;
    for (const group of groups) {
        for (const analysis of group.analyses) {
            if (selectedAnalyses.some((s: SingleAnalysisStore) => s.id === analysis.id)) {
                uniqueGroups += 1;
                break;
            }
        }
    }
    return uniqueGroups;
});
</script>

<style scoped>

</style>
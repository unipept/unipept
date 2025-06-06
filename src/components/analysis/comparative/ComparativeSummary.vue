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

    <v-unipept-card class="mt-4 pa-0">
        <v-card-title>
            <span class="text-h4">Sample ordering</span>
        </v-card-title>
        <v-card-text>
<!--            <h2 class="pb-2">-->
<!--                Ordering-->
<!--            </h2>-->
            <v-row>
                <v-col cols="12">
                    <v-table density="compact">
                        <thead>
                            <tr>
                                <th class="text-left" style="width: 20px;"></th>
                                <th class="text-left">
                                    Name
                                </th>
                                <th class="text-left">
                                    Peptides
                                </th>
                                <th class="text-left">
                                    Match ratio
                                </th>
                            </tr>
                        </thead>
                        <draggable v-model="selectedAnalyses" item-key="id" tag="tbody">
                            <template #item="{ element, index }">
                                <tr style="cursor: grab" :class="index === 0 ? 'primary-sample' : ''">
                                    <td>
                                        <v-icon color="grey-lighten-1">mdi-menu</v-icon>
                                    </td>
                                    <td>{{ element.name }}</td>
                                    <td>{{ formatNumber(element.peptides.length) }}</td>
                                    <td>{{ ((element.peptideTrust.matchedPeptides / element.peptideTrust.searchedPeptides) * 100).toFixed(2) }}%</td>
                                </tr>
                            </template>
                        </draggable>
                        <tfoot>
                                <tr class="summary-row font-weight-bold">
                                    <td class="text-right">Total</td>
                                    <td>{{ selectedAnalyses.length }} samples</td>
                                    <td>{{ formatNumber(totalPeptides) }}</td>
                                    <td>{{ averageMatchedPeptides.toFixed(2) }}% (average)</td>
                                </tr>
                            </tfoot>

                    </v-table>
                </v-col>
            </v-row>
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
import draggable from 'vuedraggable';

const { groups } = defineProps<{
    groups: GroupAnalysisStore[],
}>();

const selectedAnalyses = defineModel<SingleAnalysisStore[]>("selected-analyses", { required: true });

const { formatNumber } = useNumberFormatter();

const totalPeptides: ComputedRef<number> = computed(() => {
    if (!selectedAnalyses.value || selectedAnalyses.value.length === 0) {
        return 0;
    }

    return selectedAnalyses.value.reduce((acc: number, s: SingleAnalysisStore) => acc + s.peptideTrust!.searchedPeptides, 0);
});

const matchedPeptides: ComputedRef<number> = computed(() => {
    if (!selectedAnalyses.value || selectedAnalyses.value.length === 0) {
        return 0;
    }

    return selectedAnalyses.value.reduce((acc: number, s: SingleAnalysisStore) => acc + s.peptideTrust!.matchedPeptides, 0);
});

const averageMatchedPeptides: ComputedRef<number> = computed(() => {
    if (!selectedAnalyses.value || selectedAnalyses.value.length === 0) {
        return 0;
    }

    return (selectedAnalyses.value.map((s) => s.peptideTrust!.matchedPeptides / s.peptideTrust!.searchedPeptides).reduce((acc, curr) => acc + curr, 0) / selectedAnalyses.value.length) * 100;
});

const totalUniqueGroups: ComputedRef<number> = computed(() => {
    let uniqueGroups: number = 0;
    for (const group of groups) {
        for (const analysis of group.analyses) {
            if (selectedAnalyses.value.some((s: SingleAnalysisStore) => s.id === analysis.id)) {
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
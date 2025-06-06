<template>
    <v-table density="compact">
        <thead>
        <tr>
            <th class="text-left" style="width: 20px;">
                <v-tooltip text="Drag-and-drop samples to reorder them">
                    <template v-slot:activator="{ props }">
                        <v-icon color="grey-darken-3" v-bind="props" style="cursor: pointer;">
                            mdi-swap-vertical
                        </v-icon>
                    </template>
                </v-tooltip>
            </th>
            <!-- Column reserved to display the primary sample star -->
            <th class="text-center" style="width: 20px;"></th>
            <th class="text-left">
                Name
            </th>
            <th class="text-right">
                Matched peptides
            </th>
            <th class="text-right">
                Search peptides
            </th>
            <th class="text-right">
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
                    <td>
                        <v-tooltip text="This is the reference sample, used as primary indicator against which all other samples are compared.">
                            <template v-slot:activator="{ props }">
                                <v-icon v-if="index === 0" color="secondary" v-bind="props" style="cursor: pointer">
                                    mdi-star
                                </v-icon>
                            </template>
                        </v-tooltip>
                    </td>
                    <td>{{ element.name }}</td>
                    <td class="text-right">{{ formatNumber(element.peptideTrust.matchedPeptides) }}</td>
                    <td class="text-right">{{ formatNumber(element.peptideTrust.searchedPeptides) }}</td>
                    <td class="text-right">{{ ((element.peptideTrust.matchedPeptides / element.peptideTrust.searchedPeptides) * 100).toFixed(2) }}%</td>
                </tr>
            </template>
        </draggable>
        <tfoot>
        <tr class="summary-row font-weight-bold">
            <td class="text-right"></td>
            <td></td>
            <td>{{ selectedAnalyses.length }} samples</td>
            <td class="text-right">{{ formatNumber(totalMatchedPeptides) }} (Total)</td>
            <td class="text-right">{{ formatNumber(totalSearchedPeptides) }} (Total)</td>
            <td class="text-right">{{ averageMatchedPeptides.toFixed(2) }}% (Avg.)</td>
        </tr>
        </tfoot>

    </v-table>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';
import {SingleAnalysisStore} from "@/store/SingleAnalysisStore";
import {useNumberFormatter} from "@/composables/useNumberFormatter";
import {computed, ComputedRef} from "vue";

const selectedAnalyses = defineModel<SingleAnalysisStore[]>("selected-analyses", { required: true });

const { formatNumber } = useNumberFormatter();

const totalMatchedPeptides: ComputedRef<number> = computed(() => {
    if (!selectedAnalyses.value || selectedAnalyses.value.length === 0) {
        return 0;
    }

    return selectedAnalyses.value.reduce((acc: number, s: SingleAnalysisStore) => acc + s.peptideTrust!.matchedPeptides, 0);
});

const totalSearchedPeptides: ComputedRef<number> = computed(() => {
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
</script>

<style scoped>

</style>
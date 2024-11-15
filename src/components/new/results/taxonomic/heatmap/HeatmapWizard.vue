<template>
    <v-stepper v-model="currentStep">
        <v-stepper-header>
            <v-stepper-item
                color="primary"
                editable
                title="Horizontal axis"
                :value="1"
                :complete="currentStep > 1"
            />
            <v-divider />
            <v-stepper-item
                color="primary"
                :editable="horizontalItems.length > 0"
                title="Vertical axis"
                :value="2"
                :complete="currentStep > 2"
            />
            <v-divider />
            <v-stepper-item
                color="primary"
                :editable="horizontalItems.length > 0 && verticalItems.length > 0"
                title="Normalization"
                :value="3"
                :complete="currentStep > 3"
            />
            <v-divider />
            <v-stepper-item
                color="primary"
                :editable="horizontalItems.length > 0 && verticalItems.length > 0 && data.length > 0"
                title="Heatmap"
                :value="4"
                :complete="currentStep > 4"
            />
        </v-stepper-header>

        <v-stepper-window class="ma-0">
            <v-stepper-window-item
                class="pa-5"
                :value="1"
            >
                <data-source-select
                    v-model="horizontalItems"
                    :analysis="analysis"
                />
            </v-stepper-window-item>
            <v-stepper-window-item
                class="pa-5"
                :value="2"
            >
                <data-source-select
                    v-model="verticalItems"
                    :analysis="analysis"
                />
            </v-stepper-window-item>
            <v-stepper-window-item
                class="pa-5"
                :value="3"
            >
                <normalization-select v-model="selectedNormalizationStrategy" />
            </v-stepper-window-item>
            <v-stepper-window-item :value="4">
                <heatmap
                    :row-labels="rowLabels"
                    :column-labels="columnLabels"
                    :data="data"
                />
            </v-stepper-window-item>
        </v-stepper-window>

        <v-stepper-actions
            color="primary"
            @click:prev="currentStep -= 1"
            @click:next="currentStep += 1"
        >
            <template #next="{ props }">
                <v-btn
                    v-if="currentStep < 4"
                    v-bind="props"
                    text="next"
                    :disabled="
                        currentStep === 1 && horizontalItems.length < 1 ||
                            currentStep === 2 && verticalItems.length < 1
                    "
                />
            </template>
        </v-stepper-actions>
    </v-stepper>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import DataSourceSelect from './DataSourceSelect.vue';
import {SingleAnalysisStore} from "@/store/new/SingleAnalysisStore";
import NormalizationSelect from "@/components/new/results/taxonomic/heatmap/NormalizationSelect.vue";
import useNormalization, {NormalizationType} from "@/composables/new/useNormalization";
import {DataSourceTableItem} from "@/components/new/results/taxonomic/heatmap/DataSourceSelectTable.vue";
import Heatmap from "@/components/new/results/taxonomic/heatmap/Heatmap.vue";

const {
    normalizeAll,
    normalizeRows,
    normalizeColumns
} = useNormalization();

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore
}>();

const currentStep = ref<number>(1);
const horizontalItems = ref<DataSourceTableItem[]>([]);
const verticalItems = ref<DataSourceTableItem[]>([]);
const selectedNormalizationStrategy = ref<NormalizationType>(NormalizationType.All);

const rowLabels = computed(() => verticalItems.value.map(item => item.name));
const columnLabels = computed(() => horizontalItems.value.map(item => item.name));
const data = computed(() => {
    const result: number[][] = [];
    for (const verticalItem of verticalItems.value) {
        const row = [];
        for (const horizontalItem of horizontalItems.value) {
            row.push(horizontalItem.peptides.reduce((acc, peptide) => acc + (verticalItem.peptides.includes(peptide) ? 1 : 0), 0));
        }
        result.push(row);
    }
    return normalize(result, selectedNormalizationStrategy.value);
})

const normalize = (data: number[][], strategy: NormalizationType): number[][] => {
    switch (strategy) {
        case NormalizationType.All: return normalizeAll(data);
        case NormalizationType.Rows: return normalizeRows(data);
        case NormalizationType.Columns: return normalizeColumns(data);
        default: return data;
    }
}

watch(() => analysis, () => {
    currentStep.value = 1;
    horizontalItems.value = [];
    verticalItems.value = [];
    selectedNormalizationStrategy.value = NormalizationType.All;
});
</script>

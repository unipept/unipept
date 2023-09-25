<template>
    <v-card class="d-flex flex-column flex-grow-1">
        <v-card-title class="bg-primary text-white">
            Metaproteomics analysis
        </v-card-title>
        <v-card-text class="mt-4 d-flex flex-column">
            <div class="flex-grow-1">
                <div>
                    <h3 class="mb-2">
                        Selected datasets
                    </h3>
                    <span
                        v-if="multiAnalysisStore.empty"
                        :class="{'shaking': shaking, 'selected-placeholder': true}"
                    >
                        Please select one or more datasets from the right hand panel to continue the analysis.
                    </span>
                </div>
                <v-list two-line>
                    <v-list-item
                        v-for="dataset of multiAnalysisStore.assayStatuses"
                        :key="dataset.assay.id"
                        two-line
                        :title="dataset.assay.name"
                        :subtitle="dataset.assay.amountOfPeptides + ' peptides'"
                        class="py-4"
                    >
                        <template #append>
                            <div class="d-flex flex-column align-end">
                                <span class="text-body-2 text-medium-emphasis">
                                    {{ dateToString(dataset.assay.createdAt) }}
                                </span>
                                <v-tooltip text="Remove dataset from analysis.">
                                    <template #activator="{ props }">
                                        <v-btn
                                            class="fix-icon-list-position"
                                            variant="text"
                                            icon="mdi-delete-outline"
                                            v-bind="props"
                                            size="small"
                                            density="compact"
                                            @click="removeAssay(dataset.assay)"
                                        />
                                    </template>
                                </v-tooltip>
                            </div>
                        </template>
                    </v-list-item>
                </v-list>
            </div>
            <div class="dark-label">
                <h3 class="mb-2">
                    Search settings
                </h3>

                <v-tooltip text="Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries.">
                    <template #activator="{ props }">
                        <v-switch
                            v-model="equateIl"
                            class="pt-0 mt-0"
                            density="compact"
                            label="Equate I and L"
                            v-bind="props"
                            hide-details
                            color="primary"
                            inset
                        />
                    </template>
                </v-tooltip>

                <v-tooltip text="Remove duplicate peptides from the input before searching.">
                    <template #activator="{ props }">
                        <v-switch
                            v-model="filterDuplicates"
                            class="pt-0 mt-0"
                            density="compact"
                            label="Filter duplicate peptides"
                            v-bind="props"
                            hide-details
                            color="primary"
                            inset
                        />
                    </template>
                </v-tooltip>

                <v-tooltip text="Recombine subpeptides of miscleavages. Enabling this has a serious performance impact!">
                    <template #activator="{ props }">
                        <v-switch
                            v-model="cleavageHandling"
                            class="pt-0 mt-0"
                            density="compact"
                            label="Advanced missed cleavage handling"
                            v-bind="props"
                            hide-details
                            color="primary"
                            inset
                        />
                    </template>
                </v-tooltip>

                <div class="d-flex justify-center mt-4">
                    <v-btn
                        class="text-center"
                        color="primary"
                        prepend-icon="mdi-magnify"
                        @click="search"
                    >
                        Search
                    </v-btn>
                    <v-btn
                        class="text-center ml-3"
                        prepend-icon="mdi-restore"
                        @click="reset"
                    >
                        Start over
                    </v-btn>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Assay } from "unipept-web-components";
import AnalyticsCommunicator from '@/logic/communicators/analytics/AnalyticsCommunicator';
import useMultiAnalysis from "@/store/MultiAnalysisStore";

const emit = defineEmits(['search']);

const multiAnalysisStore = useMultiAnalysis();

const shaking = ref<boolean>(false);
const equateIl = ref<boolean>(true);
const filterDuplicates = ref<boolean>(true);
const cleavageHandling = ref<boolean>(false);

const removeAssay = (assay: Assay) => {
    multiAnalysisStore.removeAssay(assay);
};

const reset = () => {
    multiAnalysisStore.removeAllAssays();
};

const search = () => {
    multiAnalysisStore.assayStatuses.forEach(status => {
        // Log the search to the analytics server
        new AnalyticsCommunicator().logSearchMpa(status.assay.amountOfPeptides, equateIl.value, filterDuplicates.value, cleavageHandling.value, false);

        multiAnalysisStore.analyse(
            status.assay, equateIl.value, filterDuplicates.value, cleavageHandling.value
        )
    });

    emit('search');
}

const dateToString = (date: Date) => {
    date = new Date(date);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${day}/${month}/${year}`;
};
</script>

<style>
.shaking {
    animation-name: shaker;
    animation-duration: 0.2s;
    transform-origin: 50% 50%;
    animation-timing-function: linear;
}
@keyframes shaker {
    0% { transform: translate(5px, 0); }
    50% { transform: translate(-5px, 0); }
    100% { transform: translate(5px, 0); }
}
.selected-placeholder {
    display: inline-block;
}
</style>

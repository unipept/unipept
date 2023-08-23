<template>
    <v-card class="d-flex flex-column flex-grow-1">
        <v-tabs
            class="flex-grow-0"
            style="pointer-events: none;"
            slider-color="primary"
            background-color="primary"
            dark
        >
            <v-tab>Metaproteomics Analysis</v-tab>
        </v-tabs>
        <v-card-text class="flex-grow-1">
            <div>
                <h3>Selected datasets</h3>
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
                >
                    <template #prepend>
                        <v-tooltip text="Remove dataset from analysis.">
                            <template #activator="{ props }">
                                <v-btn
                                    class="fix-icon-list-position"
                                    variant="text"
                                    icon="mdi-delete-outline"
                                    v-bind="props"
                                    @click="removeAssay(dataset.assay)"
                                />
                            </template>
                        </v-tooltip>
                    </template>
                </v-list-item>
            </v-list>
        </v-card-text>
        <v-card-text>
            <div>
                <h3 class="mb-3">
                    Search settings
                </h3>

                <div class="d-flex">
                    <v-switch
                        v-model="equateIl"
                        class="pt-0 mt-0"
                        inset
                        density="compact"
                    />
                    <v-tooltip text="Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries.">
                        <template #activator="{ props }">
                            <span v-bind="props">Equate I and L</span>
                        </template>
                    </v-tooltip>
                </div>

                <div class="d-flex mt-n2">
                    <v-switch
                        v-model="filterDuplicates"
                        class="pt-0 mt-0"
                        inset
                        density="compact"
                    />
                    <v-tooltip text="Remove duplicate peptides from the input before searching.">
                        <template #activator="{ props }">
                            <span v-bind="props">Filter duplicate peptides</span>
                        </template>
                    </v-tooltip>
                </div>

                <div class="d-flex mt-n2">
                    <v-switch
                        v-model="cleavageHandling"
                        class="pt-0 mt-0"
                        inset
                        density="compact"
                    />
                    <v-tooltip text="Recombine subpeptides of miscleavages. Enabling this has a serious performance impact!">
                        <template #activator="{ props }">
                            <span v-bind="props">Advanced missed cleavage handling</span>
                        </template>
                    </v-tooltip>
                </div>

                <div class="d-flex justify-center">
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
import { ref, defineEmits } from 'vue';
import { Assay } from "unipept-web-components";
import useMultiAnalysis from '@/stores/MultiAnalysisStore';
import AnalyticsCommunicator from '@/logic/communicators/analytics/AnalyticsCommunicator';

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

<style scoped>
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

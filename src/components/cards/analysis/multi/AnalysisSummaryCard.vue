<template>
    <v-card class="d-flex flex-column flex-grow-1">
        <v-card-title class="bg-primary text-white">
            Analysis summary
        </v-card-title>

        <v-card-text class="mt-4 d-flex flex-column flex-grow-1">
            <div v-if="!activeAssayStatus">
                <v-alert type="error">
                    There currently is no active assay. Please select one from the list on the left or add a new assay.
                </v-alert>
            </div>

            <div
                v-else-if="activeAssayStatus.analysisInProgress"
                class="d-flex loading-container"
            >
                <v-progress-circular
                    indeterminate
                    color="primary"
                />
            </div>

            <v-alert
                v-else-if="activeAssayStatus.error.status"
                type="error"
                class="flex-grow-0"
            >
                <div class="flex-grow-1">
                    <div>
                        An error occurred during the analysis of this assay.
                    </div>
                    <div class="font-weight-bold mt-2">
                        Error details:
                    </div>
                    <div>
                        {{ activeAssayStatus.error.message }}
                    </div>
                    <div v-if="activeAssayStatus.error.object && (activeAssayStatus.error.object as Error).stack">
                        <div class="font-weight-bold mt-2">
                            Stack trace:
                        </div>
                        <div>
                            {{ (activeAssayStatus.error.object as Error).stack }}
                        </div>
                    </div>
                </div>
            </v-alert>

            <div
                v-else
                class="dark-label"
            >
                <h3 class="mb-2">
                    Peptide list
                </h3>
                <v-textarea
                    v-model="peptides"
                    :readonly="true"
                />

                <h3 class="mn-2">
                    Search settings
                </h3>

                <v-tooltip text="Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries">
                    <template #activator="{ props }">
                        <v-switch
                            v-model="equateIl"
                            class="pt-0 mt-0"
                            density="compact"
                            hide-details
                            color="primary"
                            label="Equate I and L"
                            v-bind="props"
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
                            hide-details
                            color="primary"
                            label="Filter duplicate peptides"
                            v-bind="props"
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
                            hide-details
                            color="primary"
                            label="Advanced missed cleavage handling"
                            v-bind="props"
                            inset
                        />
                    </template>
                </v-tooltip>

                <div class="card-actions d-flex flex-wrap justify-center">
                    <v-tooltip text="Restart search with selected samples using the settings chosen above.">
                        <template #activator="{ props }">
                            <v-btn
                                class="mr-3 mb-2"
                                :disabled="!dirty()"
                                color="primary"
                                v-bind="props"
                                prepend-icon="mdi-restore"
                                @click="reprocess()"
                            >
                                Update
                            </v-btn>
                        </template>
                    </v-tooltip>

                    <peptide-export-button
                        :assay-status="activeAssayStatus as MultiProteomicsAnalysisStatus"
                        button-text="Download results"
                    />
                </div>

                <div v-if="activeAssayStatus.data">
                    <v-divider class="my-3" />

                    <span class="peptide-match-text">
                        We managed to match {{ activeAssayStatus.data.trust.matchedPeptides }} of your
                        {{ activeAssayStatus.data.trust.searchedPeptides }} peptides. Unfortunately,
                        <a
                            style="cursor: pointer;"
                            class="link"
                            @click="showMissedPeptides = true"
                        >
                            {{ activeAssayStatus.data.trust.missedPeptides.length }}
                        </a>
                        peptides couldn't be found.
                    </span>

                    <missing-peptides-dialog
                        v-model="showMissedPeptides"
                        :missed-peptides="activeAssayStatus.data.trust.missedPeptides"
                    />
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import PeptideExportButton from '@/components/buttons/PeptideExportButton.vue';
import AnalyticsCommunicator from '@/logic/communicators/analytics/AnalyticsCommunicator';
import { storeToRefs } from "pinia";
import useMultiAnalysis from "@/store/MultiAnalysisStore";
import MissingPeptidesDialog from "@/components/dialogs/MissingPeptidesDialog.vue";
import { MultiProteomicsAnalysisStatus } from "unipept-web-components";

const multiAnalysisStore = useMultiAnalysis();

const { activeAssayStatus } = storeToRefs(multiAnalysisStore);

// The current configuration settings in the store, or if these are not currently available, the default values.
const equateIlInStore = computed(() => {
    return multiAnalysisStore.activeAssayStatus?.equateIl || true;
});

const filterDuplicatesInStore = computed(() => {
    return multiAnalysisStore.activeAssayStatus?.filterDuplicates || true;
});

const cleavageHandlingInStore = computed(() => {
    return multiAnalysisStore.activeAssayStatus?.cleavageHandling || false;
});

const equateIl = ref<boolean>(equateIlInStore.value);
const filterDuplicates = ref<boolean>(filterDuplicatesInStore.value);
const cleavageHandling = ref<boolean>(cleavageHandlingInStore.value);

const loading = ref<boolean>(false);

const showMissedPeptides = ref<boolean>(false);

const peptides = computed(() => {
    if(!multiAnalysisStore.activeAssayStatus) {
        return "";
    }

    return multiAnalysisStore.activeAssayStatus.assay.peptides.join('\n');
});

watch(() => multiAnalysisStore.activeAssayStatus, () => {
    equateIl.value = equateIlInStore.value;
    filterDuplicates.value = filterDuplicatesInStore.value;
    cleavageHandling.value = cleavageHandlingInStore.value;
})

const dirty = () => {
    return equateIl.value !== equateIlInStore.value ||
        filterDuplicates.value !== filterDuplicatesInStore.value ||
        cleavageHandling.value !== cleavageHandlingInStore.value;
}

const reprocess = () => {
    if (dirty() && multiAnalysisStore.activeAssayStatus) {
        const active = multiAnalysisStore.activeAssayStatus.assay;

        // Log the search to the analytics server
        new AnalyticsCommunicator().logSearchMpa(active.amountOfPeptides, equateIl.value, filterDuplicates.value, cleavageHandling.value, true);

        multiAnalysisStore.resetAssay(active);
        multiAnalysisStore.analyse(active, equateIl.value, filterDuplicates.value, cleavageHandling.value)
    }
}

// Loading workaround
multiAnalysisStore.$subscribe((mutation, state) => {
    loading.value = state.activeAssayStatus?.analysisInProgress || true;
});
</script>

<style scoped>
    .loading-container {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, 0);
    }

    .dark-label .v-label {
        color: black !important;
        opacity: 0.87 !important;
    }
</style>

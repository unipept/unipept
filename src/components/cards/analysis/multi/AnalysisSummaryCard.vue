<template>
    <v-card class="d-flex flex-column flex-grow-1">
        <v-tabs
            class="flex-grow-0"
            style="pointer-events: none;"
            slider-color="primary"
            background-color="primary"
            dark
        >
            <v-tab>Analysis summary</v-tab>
        </v-tabs>

        <v-card-text style="flex-grow: 1; display: flex; flex-direction: column;">
            <div v-if="!activeAssayStatus">
                <v-alert type="error">
                    There currently is no active assay. Please select one from the list on the left or add a new assay.
                </v-alert>
            </div>

            <div
                v-else-if="loading"
                class="d-flex loading-container"
            >
                <v-progress-circular
                    indeterminate
                    color="primary"
                />
            </div>

            <div v-else>
                <div class="subtitle-1">
                    Peptide list
                </div>
                <v-textarea
                    v-model="peptides"
                    :readonly="true"
                />

                <div class="subtitle-1">
                    Search settings
                </div>

                <div class="d-flex">
                    <v-switch
                        v-model="equateIl"
                        class="pt-0 mt-0"
                        inset
                        dense
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
                        dense
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
                        dense
                    />
                    <v-tooltip text="Recombine subpeptides of miscleavages. Enabling this has a serious performance impact!">
                        <template #activator="{ props }">
                            <span v-bind="props">Advanced missed cleavage handling</span>
                        </template>
                    </v-tooltip>
                </div>

                <div class="card-actions d-flex flex-wrap justify-center">
                    <v-tooltip text="Restart search with selected samples using the settings chosen above.">
                        <v-btn
                            class="mr-3 mb-2"
                            :disabled="!dirty()"
                            color="primary"
                            @click="reprocess()"
                        >
                            <v-icon left>
                                mdi-restore
                            </v-icon>
                            Update
                        </v-btn>
                    </v-tooltip>

                    <peptide-export-button
                        :assay-status="activeAssayStatus"
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
                            @click="showMissedPeptides = true"
                        >
                            {{ activeAssayStatus.data.trust.missedPeptides.length }}
                        </a>
                        peptides couldn't be found.
                    </span>

                    <v-dialog
                        v-model="showMissedPeptides"
                        :width="600"
                        scrollable
                    >
                        <missing-peptides-modal :missed-peptides="activeAssayStatus.data.trust.missedPeptides" />
                    </v-dialog>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import useMultiAnalysis from '@/stores/MultiAnalysisStore';
import { computed, ref, watch } from 'vue';
import MissingPeptidesModal from '@/components/modals/MissingPeptidesModal.vue';
import PeptideExportButton from '@/components/buttons/PeptideExportButton.vue';
import AnalyticsCommunicator from '@/logic/communicators/analytics/AnalyticsCommunicator';
import { storeToRefs } from "pinia";

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
</style>

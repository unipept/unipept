<template>
    <v-card class="d-flex flex-column">
        <v-card-title class="bg-primary text-white">
            Metaproteomics analysis
        </v-card-title>

        <v-card-text v-if="multiAnalysisStore.empty">
            <span>Please add one or more datasets by clicking the plus button above...</span>
        </v-card-text>

        <v-card-text
            v-else
            class="d-flex flex-column px-0"
        >
            <div class="flex-grow-1">
                <v-list
                    v-model="multiAnalysisStore.activeAssayStatus"
                    two-line
                >
                    <v-list-item
                        v-for="assayStatus in (assayStatuses as MultiProteomicsAnalysisStatus[])"
                        :key="assayStatus.assay.id"
                        :value="assayStatus"
                        ripple
                        :title="assayStatus.assay.name"
                        :subtitle="done(assayStatus) ? assayStatus.assay.amountOfPeptides + ' peptides': (calculating(assayStatus) ? 'Computing estimated time remaining...' : '~' + StringUtils.secondsToTimeString(assayStatus.progress.eta / 1000 ) + ' remaining...')"
                        class="pa-4"
                        @click="activateAssay(assayStatus.assay)"
                    >
                        <template #prepend>
                            <v-radio-group
                                v-if="assayStatus.analysisReady"
                                v-model="multiAnalysisStore.activeAssayStatus"
                                hide-details
                                color="primary"
                                class="mr-2"
                            >
                                <v-radio :value="assayStatus" />
                            </v-radio-group>
                            <v-avatar v-else-if="assayStatus.error.status">
                                <v-tooltip :text="`An error occurred during analysis: ${assayStatus.error.message}.`">
                                    <template #activator="{ props }">
                                        <v-icon
                                            v-bind="props"
                                            color="error"
                                        >
                                            mdi-alert-circle-outline
                                        </v-icon>
                                    </template>
                                </v-tooltip>
                            </v-avatar>
                            <v-progress-circular
                                v-else
                                :rotate="-90"
                                :size="24"
                                style="margin-left: 8px; margin-right: 16px;"
                                :value="assayStatus.progress.currentValue"
                                color="primary"
                            />
                        </template>

                        <template #append>
                            <div class="d-flex flex-column align-end mr-2">
                                <span class="text-body-2 text-medium-emphasis">
                                    {{ dateToString(assayStatus.assay.createdAt) }}
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
                                            @click="removeAssay(assayStatus.assay)"
                                        />
                                    </template>
                                </v-tooltip>
                            </div>
                        </template>
                    </v-list-item>
                </v-list>
            </div>

            <v-divider />


            <div class="text-center pt-4">
                <v-tooltip text="Compare samples above using a heatmap.">
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
                            @click="dialogOpen = true"
                        >
                            Compare samples
                        </v-btn>
                    </template>
                </v-tooltip>
            </div>
        </v-card-text>

        <v-dialog
            v-model="dialogOpen"
            width="1000px"
        >
            <v-card style="min-height: 700px;">
                <v-card-title color="primary" >
                    Heatmap wizard
                    <v-spacer />
                    <v-btn
                        icon="mdi-close"
                        @click="dialogOpen = false"
                    />
                </v-card-title>
                <div>
                    <heatmap-wizard-multi
                        v-if="multiAnalysisStore.activeAssayStatus"
                        :loading="!multiAnalysisStore.analysisCompleted(multiAnalysisStore.activeAssayStatus.assay.id)"
                        :assays="multiAnalysisStore.assayStatuses"
                    />
                    <div
                        v-else
                        style="display: flex; justify-content: center;"
                    >
                        <div
                            class="text-xs-center"
                            style="margin-top: 25px;"
                        >
                            <v-progress-circular
                                indeterminate
                                color="primary"
                            />
                        </div>
                    </div>
                </div>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Assay, StringUtils, HeatmapWizardMulti, MultiProteomicsAnalysisStatus } from "unipept-web-components";
import { withDefaults, defineProps, ref, Ref } from "vue";
import useMultiAnalysis from "@/store/MultiAnalysisStore";

export interface Props {
    assaySelectionInProgress: boolean
}

withDefaults(defineProps<Props>(), {
    assaySelectionInProgress: false
});

const multiAnalysisStore = useMultiAnalysis();

const { assayStatuses } = storeToRefs(multiAnalysisStore);

const dialogOpen = ref<boolean>(false);

const done = (assayStatus: any) => {
    //console.log(JSON.stringify(assayStatus));
    return !assayStatus.analysisInProgress;
};

const calculating = (assayStatus: any) => {
    return assayStatus.progress.currentValue === -1;
};

const activateAssay = (assay: Assay) => {
    multiAnalysisStore.activateAssay(assay);
}

const removeAssay = (assay: Assay) => {
    multiAnalysisStore.removeAssay(assay);
};

const dateToString = (date: Date) => {
    date = new Date(date);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${day}/${month}/${year}`;
};
</script>

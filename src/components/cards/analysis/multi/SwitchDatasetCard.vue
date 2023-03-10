<template>
    <v-card class="d-flex flex-column">
        <v-tabs
            class="flex-grow-0"
            style="pointer-events: none;"
            slider-color="primary"
            background-color="primary"
            dark
        >
            <v-tab>Metaproteomics Analysis</v-tab>
        </v-tabs>

        <v-card-text v-if="multiAnalysisStore.empty">
            <span>Please add one or more datasets by clicking the plus button above...</span>
        </v-card-text>

        <div v-else class="flex-grow-1">
            <v-list two-line v-model="multiAnalysisStore.activeAssayStatus">
                <v-list-item
                    v-for="assayStatus in assayStatuses"
                    :key="assayStatus.assay.id"
                    :value="assayStatus"
                    @click="activateAssay(assayStatus.assay)"
                    ripple
                >
                    <v-list-item-action>
                        <div v-if="multiAnalysisStore.analysisCompleted(assayStatus.assay.id)" class="select-dataset-radio">
                            <v-radio-group v-model="multiAnalysisStore.activeAssayStatus">
                                <v-radio :value="assayStatus"></v-radio>
                            </v-radio-group>
                        </div>
                        <v-progress-circular v-else 
                            :rotate="-90" 
                            :size="24" 
                            :value="assayStatus.progress.currentValue" 
                            color="primary"
                        />
                    </v-list-item-action>
                    
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ assayStatus.assay.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle v-if="done(assayStatus)">
                            {{ assayStatus.assay.amountOfPeptides }} peptides
                        </v-list-item-subtitle>
                        <v-list-item-subtitle v-else-if="calculating(assayStatus)">
                            Computing estimated time remaining...
                        </v-list-item-subtitle>
                        <v-list-item-subtitle v-else>
                            ~{{ StringUtils.secondsToTimeString(assayStatus.progress.eta / 1000 ) }} remaining...
                        </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action>
                        <v-list-item-action-text>
                            {{ dateToString(assayStatus.assay.createdAt) }}
                        </v-list-item-action-text>
                        <tooltip message="Remove assay from analysis.">
                            <v-icon @click="removeAssay(assayStatus.assay)" v-on:click.stop>mdi-delete-outline</v-icon>
                        </tooltip>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </div>
        <v-card-text>
            <v-divider></v-divider>
            <div class="text-center pt-4">
                <tooltip message="Compare samples above using a heatmap.">
                    <v-btn :disabled="false" @click="dialogOpen = true">
                        Compare samples
                    </v-btn>
                </tooltip>
            </div>
        </v-card-text>

        <v-dialog v-model="dialogOpen" width="1000px">
            <v-card style="min-height: 700px;">
                <v-card-title color="primary" >
                    Heatmap wizard
                    <v-spacer></v-spacer>
                    <v-btn icon @click="dialogOpen = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <div>
                    <HeatmapWizardMulti
                        v-if="multiAnalysisStore.activeAssayStatus"
                        :loading="!multiAnalysisStore.analysisCompleted(multiAnalysisStore.activeAssayStatus.assay.id)"
                        :assays="multiAnalysisStore.assayStatuses"
                    />
                    <div v-else style="display: flex; justify-content: center;">
                        <div class="text-xs-center" style="margin-top: 25px;">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </div>
                    </div>
                </div>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script setup lang="ts">
import useMultiAnalysis from '@/stores/MultiAnalysisStore';
import { storeToRefs } from 'pinia';
import { Assay, StringUtils, Tooltip, HeatmapWizardMulti } from 'unipept-web-components';
import { withDefaults, defineProps, ref } from 'vue';

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

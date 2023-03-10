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
                <span v-if="multiAnalysisStore.empty" :class="{'shaking': shaking, 'selected-placeholder': true}">
                    Please select one or more datasets from the right hand panel to continue the analysis.
                </span>
            </div>
            <v-list two-line>
                <v-list-item v-for="dataset of multiAnalysisStore.assayStatuses" two-line :key="dataset.assay.id" >
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ dataset.assay.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            {{ dataset.assay.amountOfPeptides }} peptides
                        </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action>
                        <v-list-item-action-text>
                            {{ dateToString(dataset.assay.createdAt) }}
                        </v-list-item-action-text>
                        <Tooltip message="Remove dataset from analysis.">
                            <v-btn class="fix-icon-list-position" text icon @click="removeAssay(dataset.assay)">
                                <v-icon color="grey darken-1">mdi-delete-outline</v-icon>
                            </v-btn>
                        </Tooltip>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-card-text>
        <v-card-text>
            <div>
                <h3 class="mb-3">Search settings</h3>
                
                <div class="d-flex">
                    <v-switch class="pt-0 mt-0" v-model="equateIl" inset dense />
                    <Tooltip message="Equate isoleucine (I) and leucine (L) when matching peptides to UniProt entries.">
                        <span>Equate I and L</span>
                    </Tooltip>
                </div>

                <div class="d-flex mt-n2">
                    <v-switch class="pt-0 mt-0" v-model="filterDuplicates" inset dense />
                    <Tooltip message="Remove duplicate peptides from the input before searching.">
                        <span>Filter duplicate peptides</span>
                    </Tooltip>
                </div>

                <div class="d-flex mt-n2">
                    <v-switch class="pt-0 mt-0" v-model="cleavageHandling" inset dense />
                    <Tooltip message="Recombine subpeptides of miscleavages. Enabling this has a serious performance impact!">
                        <span>Advanced missed cleavage handling</span>
                    </Tooltip>
                </div>

                <div class="d-flex justify-center">
                    <v-btn class="text-center" @click="search" color="primary">
                        <v-icon left>mdi-magnify</v-icon> Search
                    </v-btn>
                    <v-btn class="text-center ml-3" @click="reset">
                        <v-icon left>mdi-restore</v-icon> Start over
                    </v-btn>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import { Assay, Tooltip } from "unipept-web-components";
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

<template>
    <v-card flat>
        <v-card-text v-if="assayStore.empty">
            <span id="empty-dataset-placeholder">
                There are currently no datasets present in your browser's local storage.
            </span>
        </v-card-text>

        <v-list two-line class="stored-assays-list">
            <v-list-item 
                v-for="dataset of assayStore.assays" 
                :key="dataset.name"
                @click="loadAssay(dataset)"
                ripple 
            >
                <v-list-item-action>
                    <Tooltip message="Select this dataset for analysis.">
                        <v-icon>mdi-plus</v-icon>
                    </Tooltip>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{ dataset.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                        {{ dataset.amountOfPeptides }} peptides
                    </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action>
                    <v-list-item-action-text>
                        {{ dateToString(dataset.createdAt) }}
                    </v-list-item-action-text>
                    <Tooltip message="Delete this sample from local storage.">
                        <v-btn class="remove-assay-button" icon text @click="openConfirmationDialog(dataset)" v-on:click.stop>
                            <v-icon color="grey darken-1">mdi-close</v-icon>
                        </v-btn>
                    </Tooltip>
                </v-list-item-action>
            </v-list-item>
        </v-list>

        <v-dialog v-model="confirmationDialogOpen" max-width="400">
            <v-card>
                <v-card-title>Confirm sample deletion?</v-card-title>

                <v-card-text>
                    Are you sure you want to permanently delete "{{ confirmationDialogAssay?.name }}" from your browser?
                    This operation cannot be undone.
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn class="confirmation-cancel-button" color="black" text @click="closeConfirmationDialog">
                        Cancel
                    </v-btn>

                    <v-btn color="primary" text @click="removeAssay(confirmationDialogAssay); closeConfirmationDialog()">
                        OK
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script setup lang="ts">
import useAssays from '@/stores/AssayStore';
import useMultiAnalysis from '@/stores/MultiAnalysisStore';
import { Assay, Tooltip } from "unipept-web-components";
import { ref } from 'vue';

const assayStore = useAssays();
const multiAnalysisStore = useMultiAnalysis();

const confirmationDialogOpen = ref<boolean>(false);
const confirmationDialogAssay = ref<Assay | undefined>();

const loadAssay = (assay: Assay) => {
    multiAnalysisStore.addAssay(assay);
};

const removeAssay = (assay: Assay | undefined) => {
    if(assay) {
        assayStore.remove(assay);
        multiAnalysisStore.removeAssay(assay);
    }
};

const openConfirmationDialog = (assay: Assay) => {
    confirmationDialogOpen.value = true;
    confirmationDialogAssay.value = assay;
}

const closeConfirmationDialog = () => {
    confirmationDialogOpen.value = false;
    confirmationDialogAssay.value = undefined;
}

const dateToString = (date: Date) => {
    date = new Date(date);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${day}/${month}/${year}`;
};
</script>

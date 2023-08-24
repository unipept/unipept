<template>
    <v-card flat>
        <v-card-text v-if="assayStore.empty">
            <span id="empty-dataset-placeholder">
                There are currently no datasets present in your browser's local storage.
            </span>
        </v-card-text>

        <v-list
            two-line
            class="stored-assays-list"
        >
            <v-list-item
                v-for="dataset of assayStore.assays"
                :key="dataset.name"
                :title="dataset.name"
                :subtitle="dataset.amountOfPeptides + ' peptides'"
                prepend-icon="mdi-plus"
                ripple
                @click="loadAssay(dataset)"
            >
                <template #prepend>
                    <v-tooltip text="Select this dataset for analysis.">
                        <template #activator="{ props }">
                            <v-icon v-bind="props">
                                mdi-plus
                            </v-icon>
                        </template>
                    </v-tooltip>
                </template>

                <template #append>
                    <div class="d-flex justify-end">
                        <span>
                            {{ dateToString(dataset.createdAt) }}
                        </span>
                        <v-tooltip text="Delete this sample from local storage.">
                            <template #activator="{ props }">
                                <v-btn
                                    class="remove-assay-button"
                                    icon="mdi-close"
                                    v-bind="props"
                                    @click.stop="openConfirmationDialog(dataset)"
                                />
                            </template>
                        </v-tooltip>
                    </div>
                </template>
            </v-list-item>
        </v-list>

        <v-dialog
            v-model="confirmationDialogOpen"
            max-width="400"
        >
            <v-card>
                <v-card-title>Confirm sample deletion?</v-card-title>

                <v-card-text>
                    Are you sure you want to permanently delete "{{ confirmationDialogAssay?.name }}" from your browser?
                    This operation cannot be undone.
                </v-card-text>

                <v-card-actions>
                    <v-spacer />

                    <v-btn
                        class="confirmation-cancel-button"
                        color="black"
                        variant="text"
                        @click="closeConfirmationDialog"
                    >
                        Cancel
                    </v-btn>

                    <v-btn
                        color="primary"
                        variant="text"
                        @click="removeAssay(confirmationDialogAssay); closeConfirmationDialog()"
                    >
                        OK
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script setup lang="ts">
import { Assay } from "unipept-web-components";
import { ref } from 'vue';
import useAssays from "@/store/AssayStore";
import useMultiAnalysis from "@/store/MultiAnalysisStore";

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

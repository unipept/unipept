<template>
    <v-card>
        <v-tabs
            v-model="currentTab"
            slider-color="secondary"
            bg-color="primary"
            dark
        >
            <v-tab value="create">
                Create
            </v-tab>
            <v-tab value="sample-data">
                Sample data
            </v-tab>
            <v-tab value="pride">
                PRIDE
            </v-tab>
            <v-tab value="local">
                Local data
            </v-tab>
        </v-tabs>
        <v-window v-model="currentTab">
            <v-window-item value="create">
                <create-dataset-card />
            </v-window-item>
            <v-window-item value="sample-data">
                <load-sample-dataset-card />
            </v-window-item>
            <v-window-item value="pride">
                <load-pride-dataset-card />
            </v-window-item>
            <v-window-item value="local">
                <load-local-dataset-card />
            </v-window-item>
        </v-window>
        <v-snackbar
            v-model="errorSnackbar"
            color="error"
            multi-line
            :timeout="0"
            location="top"
        >
            Could not save this assay due to storage restrictions. You can still analyse the assay now, but you will not
            be able to restore it in future sessions. Please delete some unused assays to make space for this one.
            <v-btn
                color="white"
                variant="text"
                @click="errorSnackbar = false"
            >
                Close
            </v-btn>
        </v-snackbar>
    </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CreateDatasetCard from './CreateDatasetCard.vue';
import LoadLocalDatasetCard from './LoadLocalDatasetCard.vue';
import LoadSampleDatasetCard from './LoadSampleDatasetCard.vue';
import LoadPrideDatasetCard from './LoadPrideDatasetCard.vue';

const currentTab = ref<string>("create");
const errorSnackbar = ref<boolean>(false);
</script>

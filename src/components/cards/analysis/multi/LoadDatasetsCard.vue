<template>
    <v-card>
        <v-tabs
            v-model="currentTab"
            slider-color="secondary"
            background-color="primary"
            dark
        >
            <v-tab>
                Create
            </v-tab>
            <v-tab>
                Sample data
            </v-tab>
            <v-tab>
                Pride
            </v-tab>
            <v-tab>
                Local data
            </v-tab>
        </v-tabs>
        <v-tabs-items v-model="currentTab">
            <v-tab-item>
                <CreateDatasetCard />
            </v-tab-item>
            <v-tab-item>
                <LoadSampleDatasetCard />
            </v-tab-item>
            <v-tab-item>
                <LoadPrideDatasetCard />
            </v-tab-item>
            <v-tab-item>
                <LoadLocalDatasetCard />
            </v-tab-item>
        </v-tabs-items>
        <v-snackbar v-model="errorSnackbar" color="error" multi-line :timeout="0" top>
            Could not save this assay due to storage restrictions. You can still analyse the assay now, but you will not
            be able to restore it in future sessions. Please delete some unused assays to make space for this one.
            <v-btn color="white" text @click="errorSnackbar = false">
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

const currentTab = ref<number>(0);
const errorSnackbar = ref<boolean>(false);
</script>

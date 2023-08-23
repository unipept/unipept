<template>
    <v-card flat>
        <v-card-text>
            <div
                v-if="loading"
                style="display: flex; justify-content: center;"
            >
                <v-progress-circular
                    indeterminate
                    color="primary"
                />
            </div>
            <div
                v-else-if="error"
                class="connection-error"
            >
                <v-alert type="error">
                    Unable to retrieve list of sample datasets.
                </v-alert>
            </div>
            <div
                v-for="dataset of sampleDatasets"
                v-else
                :key="dataset.id"
            >
                <b>Environment:</b> {{ dataset.environment }}
                <br>
                <b>Reference:</b>
                <small>
                    {{ dataset.reference }}
                    <a
                        class="link"
                        target="_blank"
                        title="Article website"
                        :href="dataset.url"
                    >
                        <v-icon class="pb-1 primary--text" size="small">
                            mdi-link-variant
                        </v-icon>
                    </a>
                    <a
                        class="link"
                        target="_blank"
                        title="Project website"
                        :href="dataset.projectWebsite"
                    >
                        <span class="glyphicon glyphicon-share-alt"></span>
                        <v-icon
                            class="pb-1 primary--text"
                            size="small"
                        >
                            mdi-share
                        </v-icon>
                    </a>
                </small>
                <br>
                <div class="load-sample-container">
                    <v-row>
                        <v-col :cols="7">
                            <v-select
                                v-model="selectedSampleDataset[dataset.id]"
                                :items="dataset.datasets"
                                item-text="name"
                            />
                        </v-col>
                        <v-col
                            :cols="5"
                            style="display: flex; align-items: center;"
                            class="load-dataset-button"
                        >
                            <v-btn @click="selectSampleDataset(dataset.id)">
                                Load dataset
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import useId from '@/composables/useId';
import useConfigurationStore from '@/stores/ConfigurationStore';
import useMultiAnalysis from '@/stores/MultiAnalysisStore';
import { onMounted, ref } from 'vue';

interface SampleDataset {
    id: string,
    name: string;
    data: string[];
    order: number;
}

interface SampleDatasetCollection {
    id: string;
    environment: string;
    projectWebsite: string;
    reference: string;
    url: string;
    datasets: SampleDataset[];
}

const multiAnalysisStore = useMultiAnalysis();
const configurationStore = useConfigurationStore();

const { id } = useId();

const loading = ref<boolean>(false);
const error = ref<boolean>(false);

const sampleDatasets: SampleDatasetCollection[] = [];
const selectedSampleDataset: any = ref<any>({});

const retrieveDatasets = () => {
    loading.value = true;
    error.value = false;

    fetch(`${configurationStore.unipeptApiUrl}/datasets/sampledata`, { method: "POST", body: JSON.stringify({}) })
        .then(response => response.json())
        .then(response => {
            for(const item of response.sample_data) {
                const itemDatasets = item.datasets.map((dataset: any) => {
                    return {
                        id: id(),
                        name: dataset.name,
                        data: dataset.data,
                        order: dataset.order,
                    };
                }).sort((a: SampleDataset, b: SampleDataset) => a.order - b.order);

                sampleDatasets.push({
                    id: item.id,
                    environment: item.environment,
                    projectWebsite: item.project_website,
                    reference: item.reference,
                    url: item.url,
                    datasets: itemDatasets
                });

                selectedSampleDataset.value[item.id] = itemDatasets[0].name;
            }
        })
        .catch(() => error.value = true )
        .finally(() => loading.value = false );
};

const selectSampleDataset = (datatsetId: string) => {
    const sampleDatasetCollection: SampleDatasetCollection = sampleDatasets.find(
        dataset => dataset.id == datatsetId
    )!;

    const sampleDataset: SampleDataset = sampleDatasetCollection.datasets.find(
        dataset => dataset.name == selectedSampleDataset.value[datatsetId]
    )!;

    multiAnalysisStore.addAssay({
        id: sampleDataset.id,
        name: sampleDataset.name,
        peptides: sampleDataset.data,
        amountOfPeptides: sampleDataset.data.length,
        createdAt: new Date()
    });
};

onMounted(retrieveDatasets);
</script>

<style scoped>
.link {
    color: #9e9e9e !important;
    text-decoration: none;
}

.link:hover {
    color: white !important;
    text-decoration: none;
}
</style>

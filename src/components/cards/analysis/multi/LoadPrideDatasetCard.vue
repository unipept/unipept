<template>
    <v-card flat>
        <v-card-text>
            <h3>Load data from the PRIDE archive</h3>
            <p>
                You can easily load data from the
                <a
                    href="http://www.ebi.ac.uk/pride/"
                    target="_blank"
                >
                    PRIDE
                </a>
                data repository.
                Simply enter an assay id (e.g. 8500) in the field below and click the 'Load PRIDE Dataset' button.
                The corresponding dataset will then be fetched using the PRIDE API and loaded into the search form on the left.
            </p>

            <v-form
                v-model="validInputForm"
                @submit="fetchPrideDataset"
            >
                <v-text-field
                    v-model="prideId"
                    label="Assay id"
                    placeholder="e.g. 123909"
                    :disabled="loading"
                    :rules="prideInputRules"
                    @keyup.enter="fetchPrideDataset"
                />

                <div class="d-flex justify-center mt-2">
                    <v-btn
                        class="text-center"
                        :disabled="!validInputForm || loading"
                        type="submit"
                        prepend-icon="mdi-cloud-download"
                    >
                        Fetch PRIDE dataset
                    </v-btn>
                </div>
            </v-form>
        </v-card-text>

        <v-divider />

        <v-card-text
            v-if="error"
            class="connection-error"
        >
            <v-alert type="error">
                {{ error }}
            </v-alert>
        </v-card-text>

        <v-card-text
            v-else
            class="pt-0"
        >
            <v-form
                ref="form"
                v-model="validForm"
            >
                <v-row class="my-1">
                    <v-col
                        class="pb-0"
                        cols="12"
                    >
                        <v-textarea
                            v-model="peptideList"
                            class="pt-0 mt-0"
                            label="Peptide list"
                            :loading="loading"
                            :rules="peptideListRules"
                            :spellcheck="false"
                            :rows="7"
                            clearable
                            no-resize
                        />
                    </v-col>
                </v-row>

                <v-tooltip text="This name will be shown on the results page. Handy if you have many open tabs.">
                    <template #activator="{ props }">
                        <v-text-field
                            v-model="datasetName"
                            label="Name this dataset"
                            placeholder="e.g. PRIDE assay 123909"
                            :loading="loading"
                            :rules="datasetNameRules"
                            clearable
                            v-bind="props"
                        />
                    </template>
                </v-tooltip>

                <div class="d-flex justify-center mt-2">
                    <v-btn
                        class="text-center"
                        :disabled="!validForm"
                        prepend-icon="mdi-plus"
                        @click="createAssay"
                    >
                        Add to selected datasets
                    </v-btn>
                </div>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import useAssays from '@/stores/AssayStore';
import { Ref, ref } from "vue";
import { PrideCommunicator, Peptide } from 'unipept-web-components';
import useId from '@/composables/useId';
import useMultiAnalysis from '@/stores/MultiAnalysisStore';
import useConfigurationStore from '@/stores/ConfigurationStore';
import { VForm } from "vuetify/components";

const assayStore = useAssays();
const multiAnalysisStore = useMultiAnalysis();
const configurationStore = useConfigurationStore();

const { id } = useId();

const loading = ref<boolean>(false);
const error = ref<string>("");

const validInputForm = ref<boolean>(false);
const prideId = ref<string>("");

const form: Ref<VForm | null> = ref(null);
const validForm = ref(false);
const peptideList = ref("");
const datasetName = ref("");

const prideInputRules = [
    (value: string) => !!value || 'Please enter a valid PRIDE assay number'
];

const peptideListRules = [
    (value: string) => !!value || 'At least one peptide is required'
];

const datasetNameRules = [
    (value: string) => !!value || 'Name is required when the dataset is set to be saved'
];

const fetchPrideDataset = (event: Event) => {
    event.preventDefault();

    if(loading.value) {
        return;
    }

    loading.value = true;
    error.value = "";
    peptideList.value = "";

    datasetName.value = "PRIDE assay " + prideId.value;

    const communicator = new PrideCommunicator(configurationStore.prideApiPeptideUrl, configurationStore.prideBatchSize);
    communicator.getPeptides(prideId.value)
        .then((peptides: Peptide[]) => {
            if(peptides.length == 0) {
                error.value = "This PRIDE assay contains no peptides.";
            } else {
                peptideList.value = peptides.join("\n");
            }
        })
        .catch(() => error.value = "Unable to fetch the PRIDE assay.")
        .finally(() => loading.value = false);
};

const createAssay = () => {
    const peptides = peptideList.value.split('\n');

    const assay = {
        id: id(),
        name: datasetName.value,
        peptides: peptides,
        amountOfPeptides: peptides.length,
        createdAt: new Date()
    }

    assayStore.add(assay);
    multiAnalysisStore.addAssay(assay);
    form.value?.reset();
}
</script>

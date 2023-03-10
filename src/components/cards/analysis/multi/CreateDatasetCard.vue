<template>
    <v-card flat>
        <v-card-text>
            <v-form ref="form" v-model="validForm" lazy-validation>
                <v-row class="my-1">
                    <v-col class="pb-0" cols=12>
                        <v-textarea
                            class="pt-0 mt-0"
                            v-model="peptideList"
                            label="Peptide list"
                            :rules="peptideListRules"
                            :spellcheck="false"
                            :rows="7"
                            clearable
                            no-resize
                        />
                    </v-col>
                </v-row>

                <Tooltip message="This name will be shown on the results page. Handy if you have many open tabs.">
                    <v-text-field
                        v-model="datasetName"
                        label="Name this dataset"
                        placeholder="e.g. Sample B5"
                        :rules="datasetNameRules"
                        clearable
                    />
                </Tooltip>

                <div class="d-flex justify-center mt-2">
                    <v-btn
                        class="text-center"
                        :disabled="!validForm"
                        @click="createAssay"
                    >
                        <v-icon left>mdi-plus</v-icon> Add to selected datasets
                    </v-btn>
                </div>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import useAssays from '@/stores/AssayStore';
import { Tooltip } from "unipept-web-components";
import useMultiAnalysis from '@/stores/MultiAnalysisStore';
import useId from '@/composables/useId';

const assayStore = useAssays();
const multiAnalysisStore = useMultiAnalysis();

const { id } = useId();

const form = ref(null);
const validForm = ref(false);
const peptideList = ref("");
const datasetName = ref("");

const peptideListRules = [
    (value: string) => !!value || 'At least one peptide is required'
];

const datasetNameRules = [
    (value: string) => !!value || 'Name is required when the dataset is set to be saved'
];

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
    // @ts-ignore
    form.value.reset();
}
</script>

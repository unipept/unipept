<template>
    <v-card flat>
        <v-card-text>
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
                            placeholder="e.g. Sample B5"
                            :rules="datasetNameRules"
                            clearable
                            v-bind="props"
                        />
                    </template>
                </v-tooltip>

                <div class="d-flex justify-center mt-2">
                    <v-btn
                        class="text-center"
                        prepend-icon="mdi-plus"
                        :disabled="!validForm"
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
import { Ref, ref } from "vue";
import useAssays from '@/stores/AssayStore';
import useMultiAnalysis from '@/stores/MultiAnalysisStore';
import useId from '@/composables/useId';
import { VForm } from "vuetify/components";

const assayStore = useAssays();
const multiAnalysisStore = useMultiAnalysis();

const { id } = useId();

const form: Ref<VForm | null> = ref(null);
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
    form.value?.reset();
}
</script>

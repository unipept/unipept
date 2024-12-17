<template>
    <v-card
        variant="elevated"
        elevation="3"
    >
        <v-card-title class="text-h5 font-weight-regular justify-space-between">
            <h2>Create sample</h2>
            <h3>Step {{ currentStep }}. {{ currentStepTitle }}</h3>
        </v-card-title>
        <v-card-text style="padding-top: 0 !important;">
            <v-window v-model="currentStep">
                <!-- Step 1: Select input data source type -->
                <v-window-item :value="1">
                    <v-radio-group v-model="sampleCreationType" color="primary">
                        <v-radio :value="1" class="import-radio-button">
                            <template #label>
                                <div class="d-flex flex-column">
                                    <div class="text-h6 text-black">Paste Peptides Directly</div>
                                    <div class="opacity-80">
                                        Paste a list of peptides directly into a text field to create a new sample
                                        without uploading a file.
                                    </div>
                                </div>
                            </template>
                        </v-radio>
                        <v-radio :value="2" class="mt-4 import-radio-button">
                            <template #label>
                                <div class="d-flex flex-column import-radio-label">
                                    <div class="text-h6">Import via File Wizard</div>
                                    <div class="opacity-80">
                                        Select a file from your computer and use the wizard to map columns from a TSV or
                                        CSV file for import.
                                    </div>
                                </div>
                            </template>
                        </v-radio>
                        <v-radio :value="3" class="mt-4 import-radio-button">
                            <template #label>
                                <div class="d-flex flex-column import-radio-label">
                                    <div class="text-h6">Bulk Import Multiple Files</div>
                                    <div class="opacity-80">
                                        Upload multiple files containing peptides and import them all at once.
                                    </div>
                                </div>
                            </template>
                        </v-radio>
                    </v-radio-group>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            v-if="currentStep < 3"
                            color="primary"
                            variant="flat"
                            @click="currentStep++"
                        >
                            Next
                        </v-btn>
                    </v-card-actions>
                </v-window-item>

                <!-- Step 2a: Create new sample by pasting list of peptides -->
                <v-window-item :value="2" v-if="sampleCreationType === 1">
                    <add-sample-card
                        :is-unique="isUnique"
                        :sample="sample"
                        class="mb-4"
                    />

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-btn
                            variant="text"
                            @click="currentStep--"
                        >
                            Back
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="primary"
                            variant="flat"
                            @click="addSampleFromList"
                            :disabled="!sample.name || !sample.rawPeptides || !isUnique(sample)"
                        >
                            Add sample
                        </v-btn>
                    </v-card-actions>
                </v-window-item>

                <!-- Step 2b: Import samples with sequences and intensities from CSV or TSV files -->
                <v-window-item :value="2" v-if="sampleCreationType === 2">
                    <file-upload v-model="intensitiesFile" class="mb-4"/>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-btn
                            variant="text"
                            @click="currentStep--"
                        >
                            Back
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="primary"
                            variant="flat"
                            @click="uploadIntensitiesFile"
                            :disabled="intensitiesFile === null"
                        >
                            Upload file
                        </v-btn>
                    </v-card-actions>
                </v-window-item>

                <!-- Step 3b: Process uploaded file and ask user to select which columns need to be imported -->
                <v-window-item :value="3" v-if="sampleCreationType === 2">
                    <column-file-import
                        :sample="sample"
                        :column-file="intensitiesFile!"
                        v-model="validFileImport"
                        class="mb-4"
                    />

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-btn
                            variant="text"
                            @click="currentStep--"
                        >
                            Back
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="primary"
                            variant="flat"
                            :disabled="!validFileImport"
                            @click="addSampleFromCSV"
                        >
                            Add sample
                        </v-btn>
                    </v-card-actions>
                </v-window-item>

                <!-- Step 2c: Bulk import samples from files -->
                <v-window-item :value="2" v-if="sampleCreationType === 3">

                </v-window-item>
            </v-window>


        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import {SampleTableItem} from "@/components/new/sample/SampleTable.vue";
import {computed, Ref, ref} from "vue";
import AddSampleCard from "@/components/new/sample/AddSampleCard.vue";
import {DEFAULT_PEPTIDE_INTENSITIES} from "@/store/new/PeptonizerAnalysisStore";
import {v4 as uuidv4} from "uuid";
import FileUpload from "@/components/new/filesystem/FileUpload.vue";
import ColumnFileImport from "@/components/new/sample/ColumnFileImport.vue";

const emits = defineEmits<{
    (e: 'confirm', sample: SampleTableItem): void;
    (e: 'cancel'): void;
}>();

defineProps<{
    isUnique: (item: SampleTableItem) => boolean;
}>();

const currentStep: Ref<number> = ref<number>(1);
const sampleCreationType: Ref<number> = ref<number>(1);

const validFileImport: Ref<boolean> = ref<boolean>(false);

const sample = ref<SampleTableItem>({
    id: uuidv4(),
    name: "",
    rawPeptides: "",
    config: {
        equate: true,
        filter: true,
        missed: true,
        database: "UniProtKB"
    },
    intensities: new Map<string, number>()
});

const currentStepTitle = computed(() => {
    if (currentStep.value === 1) {
        return "Pick data source";
    } else if (currentStep.value === 2) {
        return "Create sample from peptides";
    } else if (currentStep.value === 3) {
        return "Select input columns";
    }
});

const addSampleFromList = () => {
    // No intensities are provided if a user only pastes a lists of peptides, so we set them to the default value
    for (const seq of sample.value.rawPeptides.split(/\r?\n/)) {
        sample.value.intensities.set(seq, DEFAULT_PEPTIDE_INTENSITIES);
    }
    emits('confirm', sample.value);
};

const addSampleFromCSV = () => {
    emits('confirm', sample.value);
}

const intensitiesFile = ref<File | null>(null);

const uploadIntensitiesFile = () => {
    currentStep.value += 1;
}
</script>

<style>
.import-radio-button .v-label {
    opacity: 1 !important;
}

</style>
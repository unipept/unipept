<template>
    <v-card
        variant="flat"
        class="d-flex flex-column bg-mainBody pa-0"
    >
        <v-card-title class="text-h5 font-weight-regular justify-space-between">
            <h2>Create sample</h2>
            <h3>Step {{ currentStep }}. {{ currentStepTitle }}</h3>
        </v-card-title>
        <v-card-text
            style="padding-top: 0 !important;"
            class="flex-grow-1"
        >
            <v-window v-model="currentStep">
                <!-- Step 1: Select input data source type -->
                <v-window-item :value="1">
                    <v-container fluid class="mb-2">
                        <v-row>
                            <v-col :cols="4">
                                <v-unipept-card
                                    class="d-flex flex-row align-center"
                                    @click="navigateToPaste"
                                    style="min-height: 100%;"
                                >
                                    <v-icon class="ml-4" color="primary">
                                        mdi-content-paste
                                    </v-icon>
                                    <div>
                                        <v-card-title class="text-primary">
                                            Paste Peptides Directly
                                        </v-card-title>
                                        <v-card-text style="padding-top: 0 !important;">
                                            Paste a list of peptides directly into a text field to create a new sample without uploading a file.
                                        </v-card-text>
                                    </div>
                                </v-unipept-card>
                            </v-col>

                            <v-col :cols="4">
                                <v-unipept-card
                                    class="d-flex flex-row align-center"
                                    @click="navigateToImportWizard"
                                    style="min-height: 100%;"
                                >
                                    <v-icon class="ml-4" color="primary">
                                        mdi-file
                                    </v-icon>
                                    <div>
                                        <v-card-title class="text-primary">
                                            Import via File Wizard
                                        </v-card-title>
                                        <v-card-text style="padding-top: 0 !important;">
                                            Select a file from your computer and use the wizard to map columns from a TSV or CSV file for import.
                                        </v-card-text>
                                    </div>
                                </v-unipept-card>
                            </v-col>

                            <v-col :cols="4">
                                <v-unipept-card
                                    class="d-flex flex-row align-center"
                                    @click="navigateToBulkUpload"
                                    style="min-height: 100%;"
                                >
                                    <v-icon class="ml-4" color="primary">
                                        mdi-file-multiple
                                    </v-icon>
                                    <div>
                                        <v-card-title class="text-primary">
                                            Bulk Import Multiple Files
                                        </v-card-title>
                                        <v-card-text style="padding-top: 0 !important;">
                                            Upload multiple files containing peptides and import them all at once.
                                        </v-card-text>
                                    </div>
                                </v-unipept-card>
                            </v-col>
                        </v-row>
                    </v-container>

                    <v-divider />

                    <v-card-actions>
                        <v-btn
                            color="red"
                            variant="tonal"
                            @click="cancel"
                        >
                            Cancel
                        </v-btn>
                    </v-card-actions>
                </v-window-item>

                <v-window-item :value="2">
                    <!-- Step 2a: Create new sample by pasting list of peptides -->
                    <div v-if="sampleCreationType === 1">
                        <add-sample-card
                            :is-unique="isUnique"
                            :sample="sample"
                            class="mb-4"
                        />

                        <v-divider />

                        <v-card-actions>
                            <v-btn
                                color="red"
                                variant="tonal"
                                @click="cancel"
                            >
                                Cancel
                            </v-btn>
                            <v-btn
                                variant="text"
                                @click="currentStep--"
                            >
                                Back
                            </v-btn>
                            <v-spacer />
                            <v-btn
                                color="primary"
                                variant="flat"
                                :disabled="!sample.name || !sample.rawPeptides || !isUnique(sample)"
                                @click="addSampleFromList"
                            >
                                Add sample
                            </v-btn>
                        </v-card-actions>
                    </div>

                    <!-- Step 2b: Import samples with sequences and intensities from CSV or TSV files -->
                    <div v-else-if="sampleCreationType === 2">
                        <file-upload
                            v-model="intensitiesFile"
                            class="mb-4"
                        />

                        <v-divider />

                        <v-card-actions>
                            <v-btn
                                color="red"
                                variant="tonal"
                                @click="cancel"
                            >
                                Cancel
                            </v-btn>
                            <v-btn
                                variant="text"
                                @click="currentStep--"
                            >
                                Back
                            </v-btn>
                            <v-spacer />
                            <v-btn
                                color="primary"
                                variant="flat"
                                :disabled="intensitiesFile === null"
                                @click="uploadIntensitiesFile"
                            >
                                Upload file
                            </v-btn>
                        </v-card-actions>
                    </div>

                    <!-- Step 2c: Bulk import samples from files -->
                    <div v-else-if="sampleCreationType === 3">
                        <file-upload
                            v-model="bulkFiles"
                            class="mb-4"
                            multiple
                        />

                        <v-divider />

                        <v-card-actions>
                            <v-btn
                                color="red"
                                variant="tonal"
                                @click="cancel"
                            >
                                Cancel
                            </v-btn>
                            <v-btn
                                variant="text"
                                @click="currentStep--"
                            >
                                Back
                            </v-btn>
                            <v-spacer />
                            <v-btn
                                color="primary"
                                variant="flat"
                                :disabled="bulkFiles.length === 0"
                                @click="uploadFilesInBulk"
                            >
                                Upload files
                            </v-btn>
                        </v-card-actions>
                    </div>
                </v-window-item>


                <v-window-item
                    v-if="sampleCreationType === 2"
                    :value="3"
                >
                    <!-- Step 3b: Process uploaded file and ask user to select which columns need to be imported -->
                    <div v-if="sampleCreationType === 2">
                        <column-file-import
                            v-model="validFileImport"
                            :sample="sample"
                            :column-file="intensitiesFile!"
                            class="mb-4"
                        />

                        <v-divider />

                        <v-card-actions>
                            <v-btn
                                color="red"
                                variant="tonal"
                                @click="cancel"
                            >
                                Cancel
                            </v-btn>
                            <v-btn
                                variant="text"
                                @click="currentStep--"
                            >
                                Back
                            </v-btn>
                            <v-spacer />
                            <v-btn
                                color="primary"
                                variant="flat"
                                :disabled="!validFileImport"
                                @click="addSampleFromCSV"
                            >
                                Add sample
                            </v-btn>
                        </v-card-actions>
                    </div>
                </v-window-item>
            </v-window>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import {SampleTableItem} from "@/components/sample/SampleTable.vue";
import {computed, Ref, ref} from "vue";
import AddSampleCard from "@/components/sample/AddSampleCard.vue";
import {v4 as uuidv4} from "uuid";
import FileUpload from "@/components/filesystem/FileUpload.vue";
import ColumnFileImport from "@/components/sample/upload/ColumnFileImport.vue";
import useFileReader from "@/composables/useFileReader";

const emits = defineEmits<{
    (e: 'confirm', samples: SampleTableItem[]): void;
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
    intensities: undefined
});

const currentStepTitle = computed(() => {
    if (currentStep.value === 1) {
        return "Pick data source";
    } else if (currentStep.value === 2) {
        return [
            "Create sample from peptides",
            "Upload TSV / CSV file",
            "Upload multiple peptide files"
        ][sampleCreationType.value - 1];
    } else if (currentStep.value === 3) {
        return "Select input columns";
    }
});

const cancel = () => {
    emits('cancel');
}

const navigateToPaste = () => {
    sampleCreationType.value = 1;
    currentStep.value += 1;
}

const navigateToImportWizard = () => {
    sampleCreationType.value = 2;
    currentStep.value += 1;
}

const navigateToBulkUpload = () => {
    sampleCreationType.value = 3;
    currentStep.value += 1;
}

const addSampleFromList = () => {
    emits('confirm', [sample.value]);
};

const addSampleFromCSV = () => {
    emits('confirm', [sample.value]);
}

const intensitiesFile = ref<File | null>(null);

const uploadIntensitiesFile = () => {
    currentStep.value += 1;
}

const bulkFiles = ref<File[]>([]);

const uploadFilesInBulk = async function() {
    const fileReader = useFileReader();

    const newSamples: SampleTableItem[] = [];

    for (const file of bulkFiles.value) {
        const peptides = await fileReader.readFile(file);
        const sampleName = file.name;

        const sample: SampleTableItem = {
            id: uuidv4(),
            name: sampleName,
            rawPeptides: peptides,
            config: {
                equate: true,
                filter: true,
                missed: true,
                database: "UniProtKB"
            },
            intensities: undefined
        }

        newSamples.push(sample);
    }

    emits('confirm', newSamples);
}
</script>

<style>
.import-radio-button .v-label {
    opacity: 1 !important;
}

.select-card-color {
    background-color: #E9F2FC;
}
</style>
<template>
    <div style="min-height: 500px;">
        <div
            v-if="loading"
            class="d-flex flex-column h-100 align-center justify-center"
            style="min-height: inherit"
        >
            <v-progress-circular
                color="primary"
                indeterminate
                size="50"
                width="5"
            />
            <span class="mt-2">Processing uploaded file...</span>
        </div>

        <v-container
            v-else
            fluid
        >
            <v-form v-model="validForm">
                <v-row>
                    <div class="v-col-md-12 py-1">
                        <h4>Document settings</h4>
                    </div>

                    <div class="v-col-md-6 py-1">
                        <v-text-field
                            v-model="sample.name"
                            label="Sample name"
                            hint="Name by which you can uniquely identify this specific sample."
                            persistent-hint
                            class="mb-2"
                            :disabled="loadingPreview"
                        />
                        <v-select
                            v-model="delimiter"
                            :items="delimiterOptions"
                            label="Delimiter"
                            hint="The delimiter used in this file has been autodetected. You can manually override it here if required."
                            item-title="name"
                            item-value="character"
                            persistent-hint
                            :disabled="loadingPreview"
                        />
                    </div>

                    <div class="v-col-md-4 py-0 document-checkbox">
                        <v-checkbox
                            v-model="useFirstRowAsHeader"
                            label="Use first row as header"
                            density="compact"
                            hint="Enable this option to treat the first row of the file as column headers. Uncheck if the file has no headers and all rows contain data."
                            persistent-hint
                            color="primary"
                            class="pb-3"
                            :disabled="loadingPreview"
                        />
                        <v-checkbox
                            v-model="sanitizeSequenceColumn"
                            label="Sanitize sequences"
                            density="compact"
                            hint="Enable this option to automatically clean the peptide sequences by removing charge states, post-translational modification annotations, and other non-sequence information."
                            persistent-hint
                            color="primary"
                            :disabled="loadingPreview"
                        />
                    </div>
                </v-row>
                <v-row class="mb-n3">
                    <div class="v-col-md-6">
                        <div class="d-flex align-center pb-1">
                            <h4>Sequence column</h4>
                            <v-icon
                                size="extra-small"
                                class="ml-1"
                                color="blue"
                            >
                                mdi-rhombus
                            </v-icon>
                        </div>
                        <v-select
                            v-model="selectedSequenceColumn"
                            :items="columns.filter(col => col !== selectedSequenceColumn)"
                            density="comfortable"
                            hint="Please indicate which column contains the peptide sequences. Use the file preview below to verify your selection."
                            persistent-hint
                            :rules="[ value => !!value || 'You must always select a column for the peptide sequence.']"
                            :disabled="loadingPreview"
                        />
                    </div>
                    <div class="v-col-md-6">
                        <div class="d-flex align-center pb-1">
                            <h4>Score column</h4>
                            <v-icon
                                size="extra-small"
                                class="mx-1"
                                color="orange"
                            >
                                mdi-rhombus
                            </v-icon>
                            <span class="font-italic">(Optional)</span>
                        </div>
                        <v-select
                            v-model="selectedIntensitiesColumn"
                            :items="columns.filter(col => col !== selectedIntensitiesColumn)"
                            density="comfortable"
                            :clearable="selectedIntensitiesColumn !== ''"
                            hint="Please indicate which column contains the peptide intensities. The intensity values are optional. If provided, they are used by the Peptonizer module and drastically improves its accuracy."
                            persistent-hint
                            persistent-clear
                            :disabled="loadingPreview"
                        />
                    </div>
                </v-row>
                <v-row>
                    <div class="v-col-md-12">
                        <h4>Import preview</h4>
                        <v-progress-linear
                            class="mt-2"
                            :indeterminate="loadingPreview"
                            :color="loadingPreview ? 'primary' : 'transparent'"
                        />
                        <v-table
                            density="compact"
                            class="column-table"
                            :class="loadingPreview ? 'opacity-40' : ''"
                        >
                            <thead>
                                <tr>
                                    <th class="bg-grey-lighten-4 first-column" />
                                    <th
                                        v-for="column of columns"
                                        :key="column"
                                        :class="[getColumnHeaderColor(column), 'font-weight-bold']"
                                    >
                                        <div class="d-flex justify-space-between">
                                            {{ column }}
                                            <div
                                                v-if="!loadingPreview && (column === selectedSequenceColumn && !validPeptides) || (column === selectedIntensitiesColumn && !validIntensities)"
                                                class="float-right pl-2"
                                            >
                                                <v-icon
                                                    v-bind="props"
                                                    color="red"
                                                >
                                                    mdi-alert
                                                </v-icon>
                                            </div>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="[row_idx, row] of rows.entries()">
                                    <td class="bg-grey-lighten-4 first-column text-right font-weight-bold">
                                        {{ row_idx + 1 }}
                                    </td>
                                    <td
                                        v-for="[cell_idx, cell] of row.entries()"
                                        :key="`${row_idx}_${cell_idx}`"
                                        :class="getColumnCellColor(cell_idx)"
                                    >
                                        {{ cell }}
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                        <div class="mt-2">
                            <div
                                v-if="!loadingPreview && selectedSequenceColumn !== '' && !validPeptides"
                                class="text-red"
                            >
                                <span class="font-weight-bold">Invalid peptide sequences:</span> sequences are only allowed to consist of letters. Check the "sanitize sequences" option to perform an autoclean on this column.
                            </div>
                            <div
                                v-if="!loadingPreview && !validIntensities"
                                class="text-red"
                            >
                                <span class="font-weight-bold">Invalid intensities:</span> all intensities must be a valid numeric value.
                            </div>
                        </div>
                    </div>
                </v-row>
            </v-form>
        </v-container>
    </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, Ref, toRef, watch} from "vue";
import { SampleTableItem } from "@/components/sample/SampleTable.vue";
import useCsvBufferReader from "@/composables/useCsvBufferReader";
import useColumnFileParser from "@/components/sample/upload/useColumnFileParser";

interface DelimiterType {
    character: string,
    name: string
}

const props = defineProps<{
    sample: SampleTableItem;
    columnFile: File;
}>();

const {
    loading: loadingPreview,
    columns,
    rows,
    validPeptides,
    validIntensities,

    parse
} = useColumnFileParser();

const columnFileRef = toRef(props, 'columnFile');

const valid = defineModel<boolean>();

const loading: Ref<boolean> = ref(false);
const validForm: Ref<boolean> = ref(false);

// Compute the combined validity
const combinedValid = computed(() => validForm.value && validPeptides.value && validIntensities.value);

watch(combinedValid, (newValue) => {
    valid.value = newValue;
});

const delimiterOptions: Ref<DelimiterType[]> = ref([
    {
        character: ",",
        name: "Comma"
    },
    {
        character: ";",
        name: "Semicolon"
    },
    {
        character: "\t",
        name: "Tab"
    }
]);
const delimiter: Ref<string> = ref(",");

const selectedSequenceColumn: Ref<string> = ref("");
const selectedIntensitiesColumn: Ref<string> = ref("");

const sanitizeSequenceColumn: Ref<boolean> = ref(true);
const useFirstRowAsHeader: Ref<boolean> = ref(true);

let linesBuffer: Uint8Array = new Uint8Array();

const getColumnHeaderColor = function(columnName: string): string {
    if (!loadingPreview.value && selectedSequenceColumn.value === columnName) {
        if (validPeptides.value) {
            return 'bg-blue-lighten-4';
        } else {
            return 'bg-red-lighten-4';
        }
    } else if (!loadingPreview.value && selectedIntensitiesColumn.value === columnName) {
        if (validIntensities.value) {
            return 'bg-orange-lighten-4';
        } else {
            return 'bg-red-lighten-4';
        }
    } else {
        return 'bg-grey-lighten-4';
    }
}

const getColumnCellColor = function(columnIdx: number): string {
    const currentCol = columns.value[columnIdx];
    if (!loadingPreview.value && selectedSequenceColumn.value === currentCol) {
        if (validPeptides.value) {
            return 'bg-blue-lighten-5';
        } else {
            return 'bg-red-lighten-5';
        }
    } else if (!loadingPreview.value && selectedIntensitiesColumn.value === currentCol) {
        if (validIntensities.value) {
            return 'bg-orange-lighten-5';
        } else {
            return 'bg-red-lighten-5';
        }
    } else {
        return '';
    }
}

const readFile = async function() {
    loading.value = true;

    const {
        buffer,
        delimiter: detectedDelimiter
    } = await useCsvBufferReader().readCsvFile(props.columnFile);

    linesBuffer = buffer;
    if (detectedDelimiter) {
        delimiter.value = detectedDelimiter;
    }

    props.sample.name = props.columnFile.name;

    await parseContent();

    loading.value = false;
}

const parseContent = async function() {
    const {
        rawPeptides,
        intensities
    } = await parse(
        linesBuffer,
        useFirstRowAsHeader.value,
        sanitizeSequenceColumn.value,
        selectedSequenceColumn.value,
        selectedIntensitiesColumn.value,
        delimiter.value
    );

    props.sample.rawPeptides = rawPeptides;
    props.sample.intensities = intensities;
}

const initialize = async function() {
    // Reset the selected values...
    selectedSequenceColumn.value = "";
    selectedIntensitiesColumn.value = "";

    sanitizeSequenceColumn.value = true;
    useFirstRowAsHeader.value = true;

    await readFile();
}

watch(delimiter, parseContent);
watch(sanitizeSequenceColumn, parseContent);
watch(useFirstRowAsHeader, parseContent);
watch(selectedSequenceColumn, async () => {
    if (selectedSequenceColumn.value === selectedIntensitiesColumn.value) {
        selectedIntensitiesColumn.value = "";
    }
    await parseContent();
});
watch(selectedIntensitiesColumn, async () => {
    if (selectedSequenceColumn.value === selectedIntensitiesColumn.value) {
        selectedSequenceColumn.value = "";
    }
    await parseContent();
});

watch(columnFileRef, initialize);
onMounted(initialize);
</script>

<style>
.column-table table {
    border-collapse: separate;
}

.column-table th:not(:last-child), .column-table td:not(:last-child) {
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.column-table .first-column {
    width: 50px;
}

.column-table table {
    table-layout: unset !important;
}

.column-table td, .column-table th {
    white-space: nowrap; /* Prevent content from wrapping to the next line */
    overflow: hidden;    /* Hide any overflowing content */
    text-overflow: ellipsis; /* Show an ellipsis for clipped text */
}

.document-checkbox .v-input__details {
    padding-top: 0 !important;
}

.document-checkbox label {
    opacity: 1 !important;
}
</style>
<template>
    <div v-if="loading" class="d-flex flex-column align-center">
        <v-progress-circular color="primary" indeterminate size="50" width="5"/>
        <span class="mt-2">Processing uploaded file...</span>
    </div>
    <v-container v-else class="px-0 py-2">
        <v-form v-model="validForm">
            <v-row>
                <div class="v-col-md-8 py-1">
                    <div class="text-h6">Delimiter</div>
                    <div>
                        The file's delimiter has been automatically detected.
                        If the detected delimiter is incorrect, you can manually select the correct delimiter here. Use the
                        file preview below to verify that the data is being parsed correctly.
                    </div>
                </div>
                <div class="v-col-md-4 py-1">
                    <v-select
                        :items="delimiterOptions"
                        v-model="delimiter"
                        item-title="name"
                        item-value="character"
                        density="comfortable"
                        hide-details
                    />
                </div>
            </v-row>
            <v-row class="mb-n3">
                <div class="v-col-md-8 pb-0 pt-1">
                    <div class="d-flex align-center">
                        <span class="text-h6">Sequence column</span>
                        <v-icon size="extra-small" class="ml-1" color="blue">mdi-rhombus</v-icon>
                    </div>
                    <div>
                        Please indicate which column contains the peptide sequences. Use the file preview below to verify
                        your selection.
                    </div>
                    <div class="v-col-md-12 pa-0">
                        <v-checkbox
                            label="Sanitize sequences?"
                            v-model="sanitizeSequenceColumn"
                            color="primary"
                            density="compact"
                            hide-details
                            class="sanitize-checkbox"
                        />
                    </div>
                </div>
                <div class="v-col-md-4 pt-1 pb-0">
                    <v-select
                        :items="columns"
                        v-model="selectedSequenceColumn"
                        density="comfortable"
                        :rules="[ value => !!value || 'You must always select a column for the peptide sequence.']"
                    />
                </div>
            </v-row>
            <v-row>
                <div class="v-col-md-8 pt-0 pb-1">
                    <div class="d-flex align-center">
                        <span class="text-h6">Intensities column</span>
                        <v-icon size="extra-small" class="mx-1" color="orange">mdi-rhombus</v-icon>
                        <span class="font-italic">(Optional)</span>
                    </div>

                    <div>
                        Please indicate which column contains the peptide intensities. The intensity values are optional.
                        If provided, they are used by the Peptonizer module and drastically improves its accuracy.
                    </div>
                </div>
                <div class="v-col-md-4 pt-0 pb-1">
                    <v-select
                        :items="columns"
                        v-model="selectedIntensitiesColumn"
                        density="comfortable"
                        hide-details
                        clearable
                    />
                </div>
            </v-row>
            <v-row>
                <div class="v-col-md-12">
                    <span class="text-h6">File preview</span>
                    <v-table density="compact" class="column-table">
                        <thead>
                        <tr>
                            <th class="bg-grey-lighten-4 first-column"></th>
                            <th
                                v-for="column of columns"
                                :key="column"
                                :class="[getColumnHeaderColor(column), 'font-weight-bold']" >
                                <div class="d-flex justify-space-between">
                                    {{ column }}
                                    <div
                                        v-if="(column === selectedSequenceColumn && !validPeptides) || (column === selectedIntensitiesColumn && !validIntensities)"
                                        class="float-right pl-2"
                                    >
                                        <v-icon v-bind="props" color="red">
                                            mdi-alert
                                        </v-icon>
                                    </div>
                                </div>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                            <tr v-for="[row_idx, row] of rows.slice(1, 6).entries()">
                                <td class="bg-grey-lighten-4 first-column text-right font-weight-bold">{{ row_idx + 1 }}</td>
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
                        <div v-if="selectedSequenceColumn !== '' && !validPeptides" class="text-red" >
                            <span class="font-weight-bold">Invalid peptide sequences:</span> sequences are only allowed to consist of letters. Check the "sanitize sequences" option to perform an autoclean.
                        </div>
                        <div v-if="!validIntensities" class="text-red">
                            <span class="font-weight-bold">Invalid intensities:</span> all intensities must be a valid numeric value.
                        </div>
                    </div>
                </div>
            </v-row>
        </v-form>
    </v-container>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, Ref, toRef, watch} from "vue";
import { SampleTableItem } from "@/components/new/sample/SampleTable.vue";
import useFileParser from "@/composables/new/useFileParser";

interface DelimiterType {
    character: string,
    name: string
}

const props = defineProps<{
    sample: SampleTableItem;
    columnFile: File;
}>();

const columnFileRef = toRef(props, 'columnFile');

const valid = defineModel<boolean>();

const validForm: Ref<boolean> = ref(false);
const validPeptides: Ref<boolean> = ref(true);
const validIntensities: Ref<boolean> = ref(true);

// Compute the combined validity
const combinedValid = computed(() => validForm.value && validPeptides.value && validIntensities.value);

watch(combinedValid, (newValue) => {
    valid.value = newValue;
});

// Read the contents from the file and render a simple preview
const columns: Ref<string[]> = ref([]);
const rows: Ref<string[][]> = ref([]);
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
const loading: Ref<boolean> = ref(true);

const selectedSequenceColumn: Ref<string> = ref("");
const selectedIntensitiesColumn: Ref<string> = ref("");

const sanitizeSequenceColumn: Ref<boolean> = ref(false);

let lines: string[] = [];

const getColumnHeaderColor = function(columnName: string): string {
    if (selectedSequenceColumn.value === columnName) {
        if (validPeptides.value) {
            return 'bg-blue-lighten-4';
        } else {
            return 'bg-red-lighten-4';
        }
    } else if (selectedIntensitiesColumn.value === columnName) {
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
    if (selectedSequenceColumn.value === currentCol) {
        if (validPeptides.value) {
            return 'bg-blue-lighten-5';
        } else {
            return 'bg-red-lighten-5';
        }
    } else if (selectedIntensitiesColumn.value === currentCol) {
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

    const fileParser = useFileParser();
    lines = (await fileParser.parseFile(props.columnFile)).split(/\r?\n/);

    props.sample.name = props.columnFile.name;

    // Try to automatically check which delimiter was used.
    const detectedDelimiter = fileParser.detectDelimiter(lines[0]);
    if (detectedDelimiter) {
        delimiter.value = detectedDelimiter;
    }

    loading.value = false;
}

const stripPeptideSequence = function(peptide: string): string {
    // Regular expression to match PTMs (e.g., [modification]) and charge states (e.g., +2, -3, /+2, /-3)
    return peptide.replace(/\[.*?\]|\/?[+-]?\d+/g, '');
}

const isValidPeptide = function(sequence: string): boolean {
    // Regular expression to check if the string contains only letters
    return /^[A-Za-z]+$/.test(sequence);
}

const parseContent = async function() {
    loading.value = true;

    // First parse the header
    columns.value = lines[0].split(delimiter.value);

    // Reset rows
    rows.value = [];
    for (const line of lines.slice(1)) {
        if (line.trim() !== "") {
            rows.value.push(line.trim().split(delimiter.value));
        }
    }

    // Figure out which column index has been selected by the user for the peptide sequences.
    const selectedSeqColIdx = columns.value.indexOf(selectedSequenceColumn.value);
    validPeptides.value = true;

    if (selectedSeqColIdx >= 0 && selectedSeqColIdx < columns.value.length) {
        if (sanitizeSequenceColumn.value) {
            for (const row of rows.value) {
                row[selectedSeqColIdx] = stripPeptideSequence(row[selectedSeqColIdx]);
            }
        }

        // Test if all peptides are valid sequences
        let rowIdx = 0;
        while (rowIdx < rows.value.length && validPeptides.value) {
            const row = rows.value[rowIdx];
            validPeptides.value = validPeptides.value && isValidPeptide(row[selectedSeqColIdx]);
            rowIdx++;
        }
    } else {
        validPeptides.value = false;
    }

    const selectedIntensitiesColIdx = columns.value.indexOf(selectedIntensitiesColumn.value);
    validIntensities.value = true;

    if (selectedIntensitiesColIdx >= 0 && selectedIntensitiesColIdx < columns.value.length) {
        // Test if all intensities are valid
        let rowIdx = 0;
        while (rowIdx < rows.value.length) {
            const row = rows.value[rowIdx];
            validIntensities.value = validIntensities.value && !isNaN(parseFloat(row[selectedIntensitiesColIdx]));
            rowIdx++;
        }
    }

    if (validPeptides.value && validIntensities.value) {
        props.sample.rawPeptides = rows.value.map((row) => row[selectedSeqColIdx]).join("\n");
        props.sample.intensities = new Map<string, number>(
            rows.value.map((row) => [row[selectedSeqColIdx], parseFloat(row[selectedIntensitiesColIdx])])
        );
    }

    loading.value = false;
}

const initialize = async function() {
    selectedSequenceColumn.value = "";
    selectedIntensitiesColumn.value = "";

    await readFile();
    await parseContent();
}

watch(delimiter, parseContent);
watch(selectedSequenceColumn, parseContent);
watch(sanitizeSequenceColumn, parseContent);
watch(selectedIntensitiesColumn, parseContent);

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

.column-table td {
    white-space: nowrap; /* Prevent content from wrapping to the next line */
    overflow: hidden;    /* Hide any overflowing content */
    text-overflow: ellipsis; /* Show an ellipsis for clipped text */
}

.sanitize-checkbox label {
    opacity: 1 !important;
}

.sanitize-checkbox {
    position: relative;
    left: -5px;
    top: -8px;
    height: 30px;
}
</style>
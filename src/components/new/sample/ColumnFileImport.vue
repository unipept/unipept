<template>
    <div v-if="loading" class="d-flex flex-column align-center">
        <v-progress-circular color="primary" indeterminate size="50" width="5"/>
        <span class="mt-2">Processing uploaded file...</span>
    </div>
    <v-container v-else class="pa-0">
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
        <v-row>
            <div class="v-col-md-8 py-1">
                <div class="d-flex align-center">
                    <span class="text-h6">Sequence column</span>
                    <v-icon size="extra-small" class="ml-1" color="blue">mdi-rhombus</v-icon>
                </div>
                <div>
                    Please indicate which column contains the peptide sequences. Use the file preview below to verify
                    your selection.
                </div>
            </div>
            <div class="v-col-md-4 py-1">
                <v-select
                    :items="columns"
                    v-model="selectedSequenceColumn"
                    density="comfortable"
                    hide-details
                />
            </div>
        </v-row>
        <v-row>
            <div class="v-col-md-8 py-1">
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
            <div class="v-col-md-4 py-1">
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
                                {{ column }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="[row_idx, row] of rows.entries()">
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
            </div>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import {computed, ref, Ref, watch} from "vue";
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

let lines: string[] = [];

const getColumnHeaderColor = function(columnName: string): string {
    if (selectedSequenceColumn.value === columnName) {
        return 'bg-blue-lighten-4';
    } else if (selectedIntensitiesColumn.value === columnName) {
        return 'bg-orange-lighten-4';
    } else {
        return 'bg-grey-lighten-4';
    }
}

const getColumnCellColor = function(columnIdx: number): string {
    const currentCol = columns.value[columnIdx];
    if (selectedSequenceColumn.value === currentCol) {
        return 'bg-blue-lighten-5';
    } else if (selectedIntensitiesColumn.value === currentCol) {
        return 'bg-orange-lighten-5';
    } else {
        return '';
    }
}

const readFile = async function() {
    loading.value = true;

    const fileParser = useFileParser();
    lines = (await fileParser.parseFile(props.columnFile)).split(/\r?\n/);

    // Try to automatically check which delimiter was used.
    const detectedDelimiter = fileParser.detectDelimiter(lines[0]);
    if (detectedDelimiter) {
        delimiter.value = detectedDelimiter;
    }

    loading.value = false;
}

const parseContent = async function() {
    loading.value = true;

    // First parse the header
    columns.value = lines[0].split(delimiter.value);

    // Reset rows
    rows.value = [];
    for (const line of lines.slice(1, 6)) {
        rows.value.push(line.split(delimiter.value));
    }

    loading.value = false;
}

watch(delimiter, () => {
    parseContent();
});

const initialize = async function() {
    await readFile();
    await parseContent();
}

initialize();
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
</style>
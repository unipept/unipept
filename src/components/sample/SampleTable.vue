<template>
    <v-data-table
        v-model:items="samples"
        v-model:expanded="expanded"
        :headers="headers"
        :items-per-page="25"
        :server-items-length="0"
        :loading="false"
        density="compact"
        hide-default-footer
        class="sample-table bg-transparent"
    >
        <template #no-data>
            <v-alert
                class="ma-3"
                density="compact"
                type="info"
                variant="tonal"
                text="No samples added yet"
            />
        </template>

        <template #header.crap>
            <v-tooltip width="30%">
                <template #activator="{ props: tooltip }">
                    <span>Filter out cRAP</span>
                    <v-icon
                        v-bind="tooltip"
                        class="ms-1"
                        icon="mdi-information"
                        size="small"
                    />
                </template>
                <span>
                    Remove common contaminants from the sample using the cRAP database (https://www.thegpm.org/crap/)
                </span>
            </v-tooltip>
        </template>

        <template #item.name="{ item }">
            <v-text-field
                v-model="item.name"
                class="name-text-field"
                density="compact"
                variant="underlined"
                :rules="[
                    v => !!v || 'Provide a valid name for your database',
                    _ => isUnique(item) || 'Name must be unique'
                ]"
                hide-details="auto"
            />
        </template>

        <template #item.equate="{ item }">
            <v-checkbox
                v-model="item.config.equate"
                color="primary"
                density="compact"
                hide-details
            />
        </template>

        <template #item.filter="{ item }">
            <v-checkbox
                v-model="item.config.filter"
                color="primary"
                density="compact"
                hide-details
            />
        </template>

        <template #item.crap="{ item }">
            <v-checkbox
                v-model="item.config.useCrap"
                color="primary"
                density="compact"
                hide-details
            />
        </template>

        <template #item.database="{ item }">
            <database-select
                v-model="item.config.database"
                variant="underlined"
                hide-details
            />
        </template>

        <template #item.count="{ item }">
            <div class="d-flex align-center">
                <v-tooltip text="Show all peptides and scores">
                    <template #activator="{ props }">
                        <v-icon
                            v-bind="props"
                            @click="() => expandItem(item)"
                        >
                            {{ expanded.includes(item.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
                        </v-icon>
                    </template>
                </v-tooltip>
                <span>{{ item.rawPeptides.split("\n").map(p => p.trim()).filter(p => p.length > 0).length }}</span>
            </div>
        </template>

        <template #item.action="{ index }">
            <v-tooltip text="Remove">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        color="error"
                        density="compact"
                        variant="text"
                        icon="mdi-delete-outline"
                        @click="removeSample(index)"
                    />
                </template>
            </v-tooltip>

            <v-tooltip text="Duplicate" class="ml-2">
                <template #activator="{ props }">
                    <v-btn
                        v-bind="props"
                        color="grey-darken-2"
                        density="compact"
                        variant="text"
                        icon="mdi-content-duplicate"
                        @click="duplicateSample(index)"
                    />
                </template>
            </v-tooltip>
        </template>

        <template #expanded-row="{ columns, item }">
            <tr>
                <td :colspan="columns.length">
                    <sample-content-table
                        class="my-2"
                        :sample="item"
                    />
                </td>
            </tr>
        </template>
    </v-data-table>
</template>

<script setup lang="ts">
import {ref} from "vue";
import DatabaseSelect from "@/components/database/DatabaseSelect.vue";
import SampleContentTable from "@/components/sample/SampleContentTable.vue";
import {v4 as uuidv4} from "uuid"

const samples = defineModel<SampleTableItem[]>({ required: true });

const expanded = ref<string[]>([]);

const isUnique = (item: SampleTableItem) => {
    return samples.value!.filter(s => s.id !== item?.id && s.name === item.name).length === 0
};

const expandItem = (item: SampleTableItem) => {
    expanded.value = expanded.value.includes(item.id) ? [] : [ item.id ];
};

const removeSample = (index: number) => {
    samples.value.splice(index, 1);
    samples.value = [ ...samples.value ];
}

const duplicateSample = (index: number) => {
    const sample = samples.value[index];

    let counter = 1;
    while (samples.value.find(s => s.name === `${sample.name} - copy ${counter}`)) {
        counter++;
    }

    const newSample = {
        id: uuidv4(),
        name: `${sample.name} - copy ${counter}`,
        rawPeptides: `${sample.rawPeptides}`,
        intensities: sample.intensities ? new Map(sample.intensities) : undefined,
        config: { ...sample.config }
    };
    samples.value = [ ...samples.value, newSample ];
}

// @ts-ignore need to annotate headers until Vuetify 3 correctly exposes type of headers
const headers: any = [
    {
        title: "Sample name",
        align: "start",
        value: "name",
    },
    {
        title: "Equate I and L",
        align: "start",
        value: "equate",
    },
    {
        title: "Filter duplicates",
        align: "start",
        value: "filter",
    },
    {
        title: "Use cRAP",
        align: "start",
        value: "crap",
    },
    {
        title: "Database",
        align: "start",
        value: "database",
    },
    {
        title: "# Peptides",
        align: "start",
        value: "count",
    },
    {
        title: "",
        align: "center",
        value: "action",
        width: "10%",
        sortable: false
    }
];

export interface SampleTableItem {
    id: string;
    name: string;
    rawPeptides: string;
    config: {
        equate: boolean;
        filter: boolean;
        useCrap: boolean;
        database: string;
    };
    intensities: Map<string, number> | undefined;
}
</script>

<style>
.name-text-field:deep(input) {
    padding-top: 0;
}

a {
    color: #2196f3;
    text-decoration: none;
}

a:hover {
    text-decoration: none;
    cursor: pointer;
}

.sample-table table {
    table-layout: fixed;
}
</style>

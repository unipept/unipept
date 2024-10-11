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
        show-expand
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

        <template #item.name="{ item }">
            <v-text-field
                v-model="item.sample.name"
                class="name-text-field"
                density="compact"
                variant="underlined"
                :rules="[
                    v => !!v || 'Provide a valid name for your database',
                ]"
                hide-details
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

        <template #item.missed="{ item }">
            <v-checkbox
                v-model="item.config.missed"
                color="primary"
                density="compact"
                disabled
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
            {{ item.sample.peptides.length }}
        </template>

        <template #item.action="{ index }">
            <v-btn
                color="error"
                density="compact"
                variant="text"
                icon="mdi-delete"
                @click="removeSample(index)"
            />
        </template>

        <template #expanded-row="{ columns, item }">
            <tr>
                <td :colspan="columns.length">
                    <create-sample-type
                        v-model="item.peptides"
                        :type="item.type"
                    />
                </td>
            </tr>
        </template>

        <template #body.append>
            <tr>
                <td colspan="7">
                    <div class="d-flex justify-center pa-1">
                        <v-menu>
                            <template #activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    text="Add new sample"
                                    color="primary"
                                    variant="text"
                                    prepend-icon="mdi-plus"
                                    append-icon="mdi-chevron-down"
                                />
                            </template>
                            <v-list>
                                <v-list-item
                                    density="compact"
                                    @click="addSamplePeptides"
                                >
                                    From peptide list
                                </v-list-item>
                                <v-list-item
                                    density="compact"
                                    @click="addSamplePride"
                                >
                                    From PRIDE identifier
                                </v-list-item>
                                <v-list-item
                                    density="compact"
                                    @click="addSampleSample"
                                >
                                    From sample data
                                </v-list-item>
                                <v-list-item
                                    density="compact"
                                    @click="console.log"
                                >
                                    Bulk import from file(s)
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                </td>
            </tr>
        </template>
    </v-data-table>
</template>

<script setup lang="ts">
import CreateSampleType, {SampleType} from "@/components/new/sample/CreateSampleType.vue";
import {ref} from "vue";
import DatabaseSelect from "@/components/new/database/DatabaseSelect.vue";
import {Analysis} from "@/components/pages/TestPage.vue";

const samples = defineModel<Analysis[]>();

const expanded = ref<number[]>([]);

const addSamplePeptides = () => addSample(SampleType.Peptides);
const addSamplePride = () => addSample(SampleType.Pride);
const addSampleSample = () => addSample(SampleType.Sample);

const addSample = (type: SampleType) => {
    const id = samples.value.reduce((acc, s) => Math.max(acc, s.id), 0) + 1;
    const sample = {
        id: id,
        sample: {
            name: "Sample" + id,
            peptides: []
        },
        config: {
            equate: true,
            filter: true,
            missed: true,
            database: "UniProtKB"
        },
        type: type
    };
    samples.value = [ ...samples.value, sample ];
    expanded.value = [ ...expanded.value, sample.id ];
};

const removeSample = (index: number) => {
    samples.value.splice(index, 1);
    samples.value = [ ...samples.value ];
}
</script>

<script lang="ts">
const headers = [
    {
        title: "sample name",
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
        title: "Advanced missed cleavages",
        align: "start",
        value: "missed",
    },
    {
        title: "Database",
        align: "start",
        value: "database",
    },
    {
        title: "peptides",
        align: "start",
        value: "count",
    },
    {
        title: "",
        align: "left",
        value: "action",
        width: "2%",
        sortable: false
    }
];
</script>

<style scoped>
.name-text-field:deep(input) {
    padding-top: 0;
}
</style>

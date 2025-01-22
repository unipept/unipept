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
        class="sample-table"
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

        <template #header.missed>
            <v-tooltip width="30%">
                <template #activator="{ props: tooltip }">
                    <span>Advanced missed cleavages</span>
                    <v-icon
                        v-bind="tooltip"
                        class="ms-1"
                        icon="mdi-information"
                        size="small"
                    />
                </template>
                <span>
                    Missed cleavage handling is now always enabled. Because of a change in Unipept's underlying search
                    engine, enabling missed cleavage handling no longer results in a performance penalty. As a result,
                    this configuration option will be removed in a future release.
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

        <template #item.missed="{ item }">
            <v-checkbox
                v-model="item.config.missed"
                color="primary"
                density="compact"
                disabled
                hide-details
            />
        </template>

        <!--        <template #item.database="{ item }">-->
        <!--            <database-select-->
        <!--                v-model="item.config.database"-->
        <!--                variant="underlined"-->
        <!--                hide-details-->
        <!--            />-->
        <!--        </template>-->

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
import DatabaseSelect from "@/components/new/database/DatabaseSelect.vue";
import SampleContentTable from "@/components/new/sample/SampleContentTable.vue";

const samples = defineModel<SampleTableItem[]>();

const expanded = ref<string[]>([]);
const addingSample = ref(false);

const isUnique = (item: SampleTableItem) => {
    return samples.value!.filter(s => s.id !== item?.id && s.name === item.name).length === 0
};

const expandItem = (item: SampleTableItem) => {
    expanded.value = expanded.value.includes(item.id) ? [] : [ item.id ];
};

const openAddSample = () => {
    addingSample.value = true;
    expanded.value = [];
};

const addSample = (sample: SampleTableItem) => {
    samples.value = [ ...samples.value!, sample ];
    addingSample.value = false;
};

const removeSample = (index: number) => {
    samples.value!.splice(index, 1);
    samples.value = [ ...samples.value! ];
}
</script>

<script lang="ts">
const headers = [
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
        title: "Advanced missed cleavages",
        align: "start",
        value: "missed",
    },
    // {
    //     title: "Database",
    //     align: "start",
    //     value: "database",
    // },
    {
        title: "# Peptides",
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

export interface SampleTableItem {
    id: string;
    name: string;
    rawPeptides: string;
    config: {
        equate: boolean;
        filter: boolean;
        missed: boolean;
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

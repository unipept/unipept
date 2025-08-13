<template>
    <v-unipept-card style="width: 800px;" elevation="10">
        <v-card-title>
            <div class="text-h5">Add {{ selectedTaxonomicRank }}</div>
        </v-card-title>
        <v-card-text style="padding-top: 4px !important;">
            <v-text-field
                v-model="featureSearchValue"
                density="compact"
                append-inner-icon="mdi-magnify"
                label="Search"
                variant="outlined"
                @click.stop
            />
            <v-data-table
                :items="tableFeatures"
                :headers="featureTableHeaders"
                :sort-by="sortByItems"
                multi-sort
                :items-per-page="currentItemsPerPage"
                :items-per-page-options="[5, 10, -1]"
                density="compact"
                :page="currentTablePage"
                @update:current-items="updateVisibleItems"
            >
                <template #item.matchingSamples="{ item }">
                    {{ item.matchingSamples }}
                </template>
                <template #item.averageRelativeAbundance="{ item }">
                    {{ (item.averageRelativeAbundance * 100).toFixed(2) }}%
                </template>
                <template #header.action>
                    <v-tooltip v-if="allInPageSelected">
                        <template v-slot:activator="{ props }">
                            <v-btn
                                style="width: 120px;"
                                color="error"
                                density="compact"
                                variant="tonal"
                                prepend-icon="mdi-minus"
                                text="Drop all"
                                v-bind="props"
                                @click="removeRows(visibleItems)"
                            />
                        </template>
                        <span>Drop all items from the heatmap</span>
                    </v-tooltip>
                    <v-tooltip v-else>
                        <template v-slot:activator="{ props }">
                            <v-btn
                                style="width: 120px;"
                                color="primary"
                                density="compact"
                                variant="tonal"
                                prepend-icon="mdi-plus"
                                text="Add all"
                                v-bind="props"
                                @click="addRows(visibleItems)"
                            />
                        </template>
                        <span>Add all items to the heatmap</span>
                    </v-tooltip>
                </template>
                <template #item.action="{ item }">
                    <v-tooltip v-if="rowNames.includes(item.name)">
                        <template v-slot:activator="{ props }">
                            <v-btn
                                style="width: 120px;"
                                color="error"
                                density="compact"
                                variant="tonal"
                                prepend-icon="mdi-minus"
                                text="Drop"
                                @click="removeRow(rowNames.indexOf(item.name))"
                                v-bind="props"
                            />
                        </template>
                        <span>Remove item from the heatmap</span>
                    </v-tooltip>
                    <v-tooltip v-else>
                        <template v-slot:activator="{ props }">
                            <v-btn
                                style="width: 120px;"
                                color="primary"
                                density="compact"
                                variant="tonal"
                                prepend-icon="mdi-plus"
                                text="Add"
                                @click="addRow(item)"
                                v-bind="props"
                            />
                        </template>
                        <span>Add item to the heatmap</span>
                    </v-tooltip>
                </template>

            </v-data-table>
        </v-card-text>
    </v-unipept-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SortItem } from "vuetify/lib/components/VDataTable/composables/sort";

interface TableFeature {
    id: number | string,
    name: string,
    matchingSamples: number,
    averageRelativeAbundance: number
}

const props = defineProps<{
    selectedTaxonomicRank: string,
    tableFeatures: TableFeature[],
    rowNames: string[]
}>();

const emit = defineEmits<{
    (e: 'add-row', feature: TableFeature): void,
    (e: 'add-rows', features: TableFeature[]): void,
    (e: 'remove-row', index: number): void,
    (e: 'remove-rows', features: TableFeature[]): void
}>();

const featureSearchValue = ref("");
const currentTablePage = ref(1);
const currentItemsPerPage = ref(10);
const visibleItems = ref<TableFeature[]>([]);

const featureTableHeaders: any = [
    {
        title: "Name",
        align: "start",
        value: "name",
        sortable: true,
        width: "40%"
    }, {
        title: "Matching Samples",
        align: "end",
        value: "matchingSamples",
        sortable: true,
        width: "25%"
    }, {
        title: "Avg. Rel. Abundance",
        align: "end",
        value: "averageRelativeAbundance",
        sortable: true,
        width: "25%"
    }, {
        title: "",
        align: "center",
        sortable: false,
        value: "action",
        width: "10%"
    }
];

const sortByItems = ref<SortItem[]>([
    {
        key: 'matchingSamples',
        order: 'desc'
    }, {
        key: 'averageRelativeAbundance',
        order: 'desc'
    }
]);

const updateVisibleItems = (currentItems: any[]) => {
    visibleItems.value = currentItems.map(i => i.raw);
};

/**
 * Returns true if all the items of the currently shown row in the data table are already selected for the heatmap.
 */
const allInPageSelected = computed(() => {
    return visibleItems.value.every(summary => props.rowNames.includes(summary.name));
});

const addRow = (feature: TableFeature) => {
    emit('add-row', feature);
};

const addRows = (features: TableFeature[]) => {
    emit('add-rows', features);
};

const removeRow = (index: number) => {
    emit('remove-row', index);
};

const removeRows = (features: TableFeature[]) => {
    emit('remove-rows', features);
};
</script>

<style scoped>

</style>
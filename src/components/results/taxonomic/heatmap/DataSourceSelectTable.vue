<template>
    <div>
        <v-select
            v-model="selectedCategory"
            :items="categories"
            label="Category"
            density="compact"
            variant="outlined"
        />

        <span v-if="selected.length > 0">
            You selected <b>{{ selected.length }}</b> out of <b>{{ items.length }}</b> items.
            <span
                v-if="selected.length !== items.length"
                class="link"
                @click="selectAll"
            >
                Select all?
            </span>
            <span
                v-else
                class="link"
                @click="selectNone"
            >
                Clear selection?
            </span>
        </span>

        <v-data-table
            v-model="selected"
            :headers="headers"
            :items="items"
            :value-comparator="Object.is"
            :search="selectedCategory"
            :custom-filter="categoryFilter"
            :items-per-page="5"
            color="primary"
            density="compact"
            show-select
            return-object
        />
    </div>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";

const selected = defineModel<DataSourceTableItem[]>();

const { items, categories } = defineProps<{
    items: DataSourceTableItem[]
    categories: string[]
}>();

const selectedCategory = ref<string>("All");

const selectAll = () => {
    selected.value = [...items];
}

const selectNone = () => {
    selected.value = [];
}

watch(() => categories, () => {
    selectedCategory.value = "All";
});
</script>

<script lang="ts">
export interface DataSourceTableItem {
    id: number | string
    name: string
    count: number
    category: string
    peptides: string[]
}

const headers = [
    {
        title: "Name",
        align: "start",
        key: "name",
        width: "40%"
    },
    {
        title: "Category",
        align: "start",
        key: "category",
        width: "40%"
    },
    {
        title: "# Peptides",
        align: "start",
        key: "count",
        width: "20%"
    },
];

const categoryFilter = (value: any, category: string, item: any) => {
    return category === "All" || item.value.category.toLowerCase() === category.toLowerCase();
}
</script>

<style scoped>
span .link {
    color: #2196F3;
    cursor: pointer;
}
</style>

<template>
    <v-text-field
        v-if="readonly"
        v-bind="selectProps"
        density="compact"
        style="pointer-events: none"
    />

    <v-select
        v-else
        v-model="selectedDatabase"
        v-bind="selectProps"
        :items="filterItems"
        density="compact"
    >
        <template #item="{ props }">
            <v-list-item
                v-bind="props"
                density="compact"
            />
        </template>

        <template #append-item>
            <v-divider class="my-1" />
            <v-list-item
                class="mb-n2"
                density="compact"
                prepend-icon="mdi-database-plus"
                @click="createDatabaseOpen = true"
            >
                Create custom database
            </v-list-item>
        </template>
    </v-select>

    <create-custom-database
        v-model="createDatabaseOpen"
        @create="createFilter"
    />
</template>

<script setup lang="ts">
import CreateCustomDatabase from "@/components/database/CreateCustomDatabase.vue";
import {computed, ref} from "vue";
import useCustomFilterStore from "@/store/new/CustomFilterStore";

const customFilterStore = useCustomFilterStore();

const selectedDatabase = defineModel<string>();

const selectProps = withDefaults(defineProps<{
    variant?: 'outlined' | 'underlined'
    hideDetails?: boolean
    readonly?: boolean
    label?: string
    class?: string
}>(), {
    hideDetails: false,
    variant: 'outlined',
    readonly: false,
});

const createDatabaseOpen = ref(false);

const filterItems = computed(() => customFilterStore.filters);

const createFilter = (name: string, filter: any) => {
    customFilterStore.addFilter(name, filter);
    selectedDatabase.value = name;
};
</script>

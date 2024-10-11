<template>
    <v-select
        v-model="selectedDatabase"
        v-bind="selectProps"
        :items="['UniProtKB']"
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

    <create-custom-database v-model="createDatabaseOpen" />
</template>

<script setup lang="ts">
import CreateCustomDatabase from "@/components/new/database/CreateCustomDatabase.vue";
import {ref} from "vue";

const selectProps = withDefaults(defineProps<{
    variant?: 'outlined' | 'underlined'
    hideDetails?: boolean
    label?: string
    class?: string
}>(), {
    hideDetails: false,
    variant: 'outlined'
});

const selectedDatabase = defineModel<string>();

const createDatabaseOpen = ref(false);
</script>

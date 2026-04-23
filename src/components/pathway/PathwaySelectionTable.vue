<template>
    <div class="pa-4">
        <!-- PathwayPilot header -->
        <div class="d-flex align-center mb-4">
            <div class="mr-4">
                <h2>PathwayPilot</h2>
                <p class="mb-1">
                    PathwayPilot maps your metaproteomics data onto KEGG metabolic pathways by linking identified
                    peptides to EC numbers. It highlights which pathway nodes are covered by your sample and lets
                    you explore enzyme activity and compound involvement across the metabolic network.
                </p>
                <span class="text-subtitle-2">
                    Vande Moortele et al. (2025) MCP
                    <a href="https://www.mcponline.org/article/S1535-9476(25)00016-7/fulltext" target="_blank" rel="noopener noreferrer">
                        doi.org/10.1016/j.mcpro.2025.100916
                    </a>
                </span>
            </div>
            <img src="../../assets/logo/pathwaypilot-logo.svg" alt="PathwayPilot logo" style="max-width: 120px; flex-shrink: 0;" />
        </div>

        <p v-if="subtitle" class="text-body-1 mb-4">{{ subtitle }}</p>

        <v-alert v-if="error" type="error" variant="tonal">
            Failed to load pathway data. Please check your network connection and try again.
        </v-alert>

        <div v-else-if="loading" class="d-flex justify-center align-center py-8">
            <v-progress-circular indeterminate color="primary" />
            <span class="ml-4">Loading pathway data...</span>
        </div>

        <v-data-table
            v-else
            v-model:page="filters.page.value"
            :headers="headers"
            :items="filters.filteredItems.value"
            :items-per-page="10"
            :sort-by="[{ key: sortKey, order: 'desc' }]"
            must-sort
            density="compact"
            hover
            :row-props="rowProps"
            @click:row="(_event: any, { item }: any) => emit('select', item)"
        >
            <template #top>
                <div class="d-flex ga-2 ma-2 align-center">
                    <v-text-field
                        v-model="filters.search.value"
                        label="Search pathways"
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                        density="compact"
                        clearable
                        hide-details
                        @click:clear="filters.search.value = ''"
                    />
                    <PathwaySelectionFilter
                        :filters="filters"
                        :categoryOptions="categoryOptions"
                        :compoundOptions="compoundOptions"
                    />
                </div>
            </template>

            <template #item.id="{ item }">
                <span class="font-weight-medium">{{ item.id }}</span>
            </template>

            <template #item.category="{ item }">
                <div class="d-flex align-center ga-1">
                    <v-icon :color="categoryColor(item.subCategory || item.category)" size="small">mdi-circle-medium</v-icon>
                    <span>{{ item.subCategory || item.category }}</span>
                </div>
            </template>

            <template #bottom="{ pageCount }">
                <div v-if="pageCount > 1" class="d-flex justify-center pa-2">
                    <v-pagination
                        v-model="filters.page.value"
                        class="me-4"
                        :length="pageCount"
                        :total-visible="10"
                        density="compact"
                    />
                </div>
            </template>
        </v-data-table>
    </div>
</template>

<script setup lang="ts">
import { categoryColor } from '@/composables/pathway/usePathwayColors';
import type { usePathwayFilters } from '@/composables/pathway/usePathwayFilters';
import PathwaySelectionFilter from './PathwaySelectionFilter.vue';

defineProps<{
    filters: ReturnType<typeof usePathwayFilters>;
    headers: { title: string; key: string; sortable?: boolean; width?: string; align?: 'start' | 'end' | 'center' }[];
    sortKey: string;
    loading?: boolean;
    error?: boolean;
    subtitle?: string;
    categoryOptions: { value: string; title: string; color: string }[];
    compoundOptions: { value: string; title: string }[];
    rowProps?: (data: any) => Record<string, any>;
}>();

const emit = defineEmits<{
    select: [item: any];
}>();
</script>

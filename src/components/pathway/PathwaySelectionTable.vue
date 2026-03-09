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
                    <a href="https://www.mcponline.org/article/S1535-9476(25)00016-7/fulltext" target="_blank">
                        doi.org/10.1016/j.mcpro.2025.100916
                    </a>
                </span>
            </div>
            <img src="../../assets/logo/pathwaypilot-logo.svg" style="max-width: 160px; flex-shrink: 0;" />
        </div>

        <p v-if="subtitle" class="text-body-1 mb-4">{{ subtitle }}</p>

        <div v-if="loading" class="d-flex justify-center align-center py-8">
            <v-progress-circular indeterminate color="primary" />
            <span class="ml-4">Loading pathway data...</span>
        </div>

        <v-alert v-else-if="error" type="error" variant="tonal">
            Failed to load pathway data. Please check your network connection and try again.
        </v-alert>

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
                    <v-btn
                        :color="filters.activeFilterCount.value > 0 ? 'primary' : undefined"
                        :variant="filters.activeFilterCount.value > 0 ? 'tonal' : 'outlined'"
                        density="compact"
                        style="height: 40px; min-width: 40px;"
                        @click="filters.openFilterDialog()"
                    >
                        <v-badge
                            v-if="filters.activeFilterCount.value > 0"
                            :content="filters.activeFilterCount.value"
                            color="primary"
                            floating
                        >
                            <v-icon>mdi-filter-variant</v-icon>
                        </v-badge>
                        <v-icon v-else>mdi-filter-variant</v-icon>
                    </v-btn>
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
                        :length="pageCount"
                        density="compact"
                    />
                </div>
            </template>
        </v-data-table>

        <!-- Filter dialog -->
        <v-dialog v-model="filters.filterDialog.value" max-width="75vw" scrollable>
            <v-card>
                <v-card-title class="d-flex align-center">
                    Filter pathways
                    <v-spacer />
                    <v-btn icon density="compact" variant="text" @click="filters.filterDialog.value = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-subtitle>
                    {{ filters.previewFilteredCount.value }} pathway{{ filters.previewFilteredCount.value === 1 ? '' : 's' }} match current filters
                </v-card-subtitle>

                <v-card-text class="pt-4">
                    <div class="d-flex">
                        <!-- Left: EC Numbers -->
                        <div class="pr-4" style="flex: 1; min-width: 0;">
                            <div class="text-subtitle-2 mb-1">EC Numbers</div>
                            <ec-treeview
                                v-model="filters.draftEcs.value"
                                :ec-ids="filters.availableEcIds.value"
                            />
                        </div>

                        <v-divider vertical class="mx-0" />

                        <!-- Right: Categories + Compounds -->
                        <div class="pl-4" style="flex: 1; min-width: 0;">
                            <div class="text-subtitle-2 mb-2">Categories</div>
                            <v-autocomplete
                                v-model="filters.draftCategories.value"
                                :items="categoryOptions"
                                item-title="title"
                                item-value="value"
                                multiple
                                chips
                                closable-chips
                                clearable
                                density="compact"
                                variant="outlined"
                                hide-details
                                placeholder="Search categories..."
                                @click:clear="filters.draftCategories.value = []"
                            >
                                <template #item="{ props: itemProps, item }">
                                    <v-list-item v-bind="itemProps" active-color="primary">
                                        <template #prepend>
                                            <div :style="{ width: '8px', height: '8px', borderRadius: '50%', marginRight: '8px', flexShrink: '0', background: item.raw.color }" />
                                        </template>
                                    </v-list-item>
                                </template>
                                <template #chip="{ props: chipProps, item }">
                                    <v-chip v-bind="chipProps" size="small">
                                        <template #prepend>
                                            <div :style="{ width: '8px', height: '8px', borderRadius: '50%', marginRight: '4px', flexShrink: '0', background: item.raw.color }" />
                                        </template>
                                    </v-chip>
                                </template>
                            </v-autocomplete>

                            <template v-if="compoundOptions.length > 0">
                                <v-divider class="my-4" />
                                <div class="text-subtitle-2 mb-2">Compounds</div>
                                <v-autocomplete
                                    v-model="filters.draftCompounds.value"
                                    :items="compoundOptions"
                                    item-title="title"
                                    item-value="value"
                                    multiple
                                    chips
                                    closable-chips
                                    clearable
                                    density="compact"
                                    variant="outlined"
                                    hide-details
                                    placeholder="Search compounds..."
                                    @click:clear="filters.draftCompounds.value = []"
                                >
                                    <template #item="{ props: itemProps }">
                                        <v-list-item v-bind="itemProps" active-color="primary">
                                            <template #prepend />
                                        </v-list-item>
                                    </template>
                                </v-autocomplete>
                            </template>
                        </div>
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-btn variant="text" color="error" @click="filters.clearFilters()">Clear all</v-btn>
                    <v-spacer />
                    <v-btn variant="tonal" color="primary" @click="filters.applyFilters()">Done</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { categoryColor } from '@/composables/pathway/usePathwayColors';
import type { usePathwayFilters } from '@/composables/pathway/usePathwayFilters';
import EcTreeview from '@/components/treeview/EcTreeview.vue';

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

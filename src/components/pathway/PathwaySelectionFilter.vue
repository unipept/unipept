<template>
    <div>
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
import type { usePathwayFilters } from '@/composables/pathway/usePathwayFilters';
import EcTreeview from '@/components/treeview/EcTreeview.vue';

defineProps<{
    filters: ReturnType<typeof usePathwayFilters>;
    categoryOptions: { value: string; title: string; color: string }[];
    compoundOptions: { value: string; title: string }[];
}>();
</script>

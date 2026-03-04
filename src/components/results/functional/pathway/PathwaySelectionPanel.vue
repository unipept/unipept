<template>
    <div class="pa-4">
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
            <img src="../../../../assets/logo/pathwaypilot-logo.svg" style="max-width: 160px; flex-shrink: 0;" />
        </div>

        <div v-if="store.status === 'Loading'" class="d-flex justify-center align-center py-8">
            <v-progress-circular indeterminate color="primary" />
            <span class="ml-4">Loading pathway data...</span>
        </div>

        <template v-else-if="store.status === 'Ready'">
            <v-data-table
                v-model:page="page"
                :headers="headers"
                :items="filteredItems"
                :items-per-page="10"
                :sort-by="[{ key: 'count', order: 'desc' }]"
                must-sort
                density="compact"
                hover
                :row-props="(data: any) => ({ class: data.item.id === store.selectedPathway?.id ? 'active-row' : '' })"
                @click:row="(_event: any, { item }: any) => onSelectPathway(item)"
            >
                <template #top>
                    <div class="d-flex ga-2 ma-2 align-center">
                        <v-text-field
                            v-model="search"
                            label="Search pathways"
                            prepend-inner-icon="mdi-magnify"
                            variant="outlined"
                            density="compact"
                            clearable
                            hide-details
                            @click:clear="search = ''"
                        />
                        <v-btn
                            :color="activeFilterCount > 0 ? 'primary' : undefined"
                            :variant="activeFilterCount > 0 ? 'tonal' : 'outlined'"
                            density="compact"
                            style="height: 40px; min-width: 40px;"
                            @click="openFilterDialog"
                        >
                            <v-badge
                                v-if="activeFilterCount > 0"
                                :content="activeFilterCount"
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
                            v-model="page"
                            :length="pageCount"
                            density="compact"
                        />
                    </div>
                </template>
            </v-data-table>
        </template>

        <v-alert
            v-else-if="store.status === 'Failed'"
            type="error"
            variant="tonal"
        >
            Failed to load pathway data. Please check your network connection and try again.
        </v-alert>

        <!-- Filter dialog -->
        <v-dialog v-model="filterDialog" max-width="75vw" scrollable>
            <v-card>
                <v-card-title class="d-flex align-center">
                    Filter pathways
                    <v-spacer />
                    <v-btn icon density="compact" variant="text" @click="filterDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-subtitle>
                    {{ previewFilteredCount }} pathway{{ previewFilteredCount === 1 ? '' : 's' }} match current filters
                </v-card-subtitle>

                <v-card-text class="pt-4">
                    <div class="d-flex">
                        <!-- Left: EC Numbers -->
                        <div class="pr-4" style="flex: 1; min-width: 0;">
                            <div class="text-subtitle-2 mb-1">EC Numbers</div>
                            <ec-treeview
                                v-model="draftEcs"
                                :ec-ids="availableEcIds"
                            />
                        </div>

                        <v-divider vertical class="mx-0" />

                        <!-- Right: Categories + Compounds -->
                        <div class="pl-4" style="flex: 1; min-width: 0;">
                            <div class="text-subtitle-2 mb-2">Categories</div>
                            <v-autocomplete
                                v-model="draftCategories"
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
                                @click:clear="draftCategories = []"
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
                                    v-model="draftCompounds"
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
                                    @click:clear="draftCompounds = []"
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
                    <v-btn variant="text" color="error" @click="clearFilters">Clear all</v-btn>
                    <v-spacer />
                    <v-btn variant="tonal" color="primary" @click="applyFilters">Done</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PathwayPilotStore, PathwayItem } from '@/store/PathwayPilotStore';
import { pathwayGroups, groupColors } from '@/logic/PathwayGroups';
import usePathwayPilotMappingStore from '@/store/PathwayPilotMappingStore';
import EcTreeview from '@/components/treeview/EcTreeview.vue';

const props = defineProps<{
    store: PathwayPilotStore;
}>();

const mappingStore = usePathwayPilotMappingStore();

const page = ref(1);
const search = ref('');
const filterDialog = ref(false);

// Draft state — what the filter dialog shows while editing
const draftEcs = ref<string[]>([]);
const draftCompounds = ref<string[]>([]);
const draftCategories = ref<string[]>([]);

// Applied state — what actually filters the table (only updated on Done)
const appliedEcs = ref<string[]>([]);
const appliedCompounds = ref<string[]>([]);
const appliedCategories = ref<string[]>([]);

const availableEcIds = computed(() => Array.from(props.store.ecs));

const categoryOptions = computed(() =>
    [...new Set(props.store.pathwayItems.map(item => item.subCategory || item.category))]
        .sort((a, b) => {
            const iA = pathwayGroups.indexOf(a), iB = pathwayGroups.indexOf(b);
            if (iA >= 0 && iB >= 0) return iA - iB;
            return iA >= 0 ? -1 : iB >= 0 ? 1 : a.localeCompare(b);
        })
        .map(name => ({ value: name, title: name, color: categoryColor(name) }))
);

const headers = [
    { title: 'ID', key: 'id', sortable: true, width: '110px' },
    { title: 'Category', key: 'category', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Count', key: 'count', sortable: true, align: 'end' as const }
];

const activeFilterCount = computed(() =>
    appliedEcs.value.length + appliedCompounds.value.length + appliedCategories.value.length
);

const compoundOptions = computed(() =>
    Array.from(props.store.compounds)
        .map(id => ({
            value: id,
            title: `${id}: ${mappingStore.compoundMapping?.get(id)?.names?.[0] ?? 'Unknown'}`
        }))
        .sort((a, b) => a.value.localeCompare(b.value))
);

const filterItems = (items: PathwayItem[], ecs: string[], compounds: string[], categories: string[]): PathwayItem[] => {
    if (ecs.length > 0) {
        const allowed = new Set<string>();
        for (const ec of ecs) {
            if (ec.endsWith('.-')) {
                // Intermediate pattern — expand by prefix matching against store ECs
                const prefix = ec.replace(/(\.-)+$/, '');
                for (const storeEc of props.store.ecs) {
                    if (storeEc.startsWith(prefix + '.') || storeEc === prefix) {
                        for (const p of props.store.pathwaysForEc(storeEc)) allowed.add(p);
                    }
                }
            } else {
                for (const p of props.store.pathwaysForEc(ec)) allowed.add(p);
            }
        }
        items = items.filter(item => allowed.has(item.id));
    }
    if (compounds.length > 0) {
        const allowed = new Set<string>();
        for (const c of compounds) for (const p of props.store.pathwaysForCompound(c)) allowed.add(p);
        items = items.filter(item => allowed.has(item.id));
    }
    if (categories.length > 0) {
        const catSet = new Set(categories);
        items = items.filter(item => catSet.has(item.subCategory || item.category));
    }
    return items;
};

// Live preview count in the dialog (based on draft state)
const previewFilteredCount = computed(() =>
    filterItems(props.store.pathwayItems, draftEcs.value, draftCompounds.value, draftCategories.value).length
);

// Table filter (based on applied state + text search)
const filteredItems = computed(() => {
    let items = filterItems(props.store.pathwayItems, appliedEcs.value, appliedCompounds.value, appliedCategories.value);
    if (search.value) {
        const q = search.value.toLowerCase();
        items = items.filter(item =>
            item.id.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q) ||
            (item.category || '').toLowerCase().includes(q) ||
            (item.subCategory || '').toLowerCase().includes(q)
        );
    }
    return items;
});

const openFilterDialog = () => {
    draftEcs.value = [...appliedEcs.value];
    draftCompounds.value = [...appliedCompounds.value];
    draftCategories.value = [...appliedCategories.value];
    filterDialog.value = true;
};

const applyFilters = () => {
    appliedEcs.value = [...draftEcs.value];
    appliedCompounds.value = [...draftCompounds.value];
    appliedCategories.value = [...draftCategories.value];
    filterDialog.value = false;
};

const clearFilters = () => {
    draftEcs.value = [];
    draftCompounds.value = [];
    draftCategories.value = [];
};

const categoryColor = (subCategory: string): string => {
    const idx = pathwayGroups.indexOf(subCategory);
    return idx >= 0 ? groupColors[idx].toString() : '#888888';
};

const onSelectPathway = (item: PathwayItem) => {
    props.store.setSelectedPathway(item);
};
</script>

<style scoped>
:deep(.active-row td) {
    background-color: rgba(76, 140, 191, 0.12);
}
</style>

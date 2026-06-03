<template>
    <div>

        <!-- ── Search hint ────────────────────────────────────────────────────── -->
        <p class="text-caption text-medium-emphasis mb-1">
            Type freely or use <code>field:value</code>. Each term gets auto-classified — dashed chips show inferred fields you can confirm or reassign.
        </p>

        <!-- ── Search bar with hints dropdown ─────────────────────────────────── -->
        <v-row density="compact">
            <v-col cols="12" style="position: relative;">
                <v-text-field
                    :model-value="search"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    prepend-inner-icon="mdi-magnify"
                    autocomplete="off"
                    placeholder='Try “sus scrofa”, “rank:species”, or just “has:GO”…'
                    @focus="onSearchFocus"
                    @blur="onSearchBlur"
                    @update:model-value="handleSearchInput"
                    @click:clear="handleClear"
                    @keydown.escape="hintsOpen = false"
                />

                <!-- Hints dropdown -->
                <v-card
                    v-if="hintsOpen"
                    class="hints-dropdown"
                    elevation="8"
                    rounded="lg"
                >
                    <div class="hints-header px-4 pt-3 pb-1">TRY TYPING&hellip;</div>
                    <v-list density="compact" class="px-2 pb-2">
                        <v-list-item
                            v-for="hint in searchHints"
                            :key="hint.query"
                            rounded="lg"
                            class="hint-item"
                            @mousedown.prevent
                            @click="applyHint(hint.query)"
                        >
                            <div class="d-flex align-center">
                                <code :class="['hint-query', 'me-4', hint.color ? `text-${hint.color}` : 'text-medium-emphasis']">
                                    {{ hint.query }}
                                </code>
                                <span class="text-body-2 text-medium-emphasis">{{ hint.description }}</span>
                            </div>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-col>
        </v-row>

        <!-- ── Quick filters + peptide count ─────────────────────────────────── -->
        <v-row density="compact" class="mb-2 align-center">
            <v-col cols="12" md="auto" class="d-flex align-center flex-wrap ga-1">
                <span class="text-caption text-medium-emphasis me-1">Quick filters:</span>

                <v-chip
                    :color="quickFilters.speciesLevel ? 'blue' : undefined"
                    :variant="quickFilters.speciesLevel ? 'flat' : 'outlined'"
                    :class="quickFilters.speciesLevel ? 'text-white' : ''"
                    size="small"
                    @click="onQuickFilterChange({ ...quickFilters, speciesLevel: !quickFilters.speciesLevel })"
                >
                    <template #prepend><v-icon class="chip-icon">mdi-bacteria-outline</v-icon></template>
                    Species level
                </v-chip>

                <v-chip
                    :color="quickFilters.hasGo ? 'amber' : undefined"
                    :variant="quickFilters.hasGo ? 'flat' : 'outlined'"
                    size="small"
                    @click="onQuickFilterChange({ ...quickFilters, hasGo: !quickFilters.hasGo })"
                >
                    <template #prepend><v-icon class="chip-icon">mdi-function-variant</v-icon></template>
                    Has GO terms
                </v-chip>

                <v-chip
                    :color="quickFilters.hasEc ? 'indigo' : undefined"
                    :variant="quickFilters.hasEc ? 'flat' : 'outlined'"
                    :class="quickFilters.hasEc ? 'text-white' : ''"
                    size="small"
                    @click="onQuickFilterChange({ ...quickFilters, hasEc: !quickFilters.hasEc })"
                >
                    <template #prepend><v-icon class="chip-icon">mdi-flask-outline</v-icon></template>
                    Has EC numbers
                </v-chip>

                <v-chip
                    :color="quickFilters.hasIpr ? 'red' : undefined"
                    :variant="quickFilters.hasIpr ? 'flat' : 'outlined'"
                    :class="quickFilters.hasIpr ? 'text-white' : ''"
                    size="small"
                    @click="onQuickFilterChange({ ...quickFilters, hasIpr: !quickFilters.hasIpr })"
                >
                    <template #prepend><v-icon class="chip-icon">mdi-database-search-outline</v-icon></template>
                    Has InterPro
                </v-chip>

                <v-chip
                    :color="quickFilters.notFound ? 'orange' : undefined"
                    :variant="quickFilters.notFound ? 'flat' : 'outlined'"
                    :class="quickFilters.notFound ? 'text-white' : ''"
                    size="small"
                    @click="onQuickFilterChange({ ...quickFilters, notFound: !quickFilters.notFound })"
                >
                    <template #prepend><v-icon class="chip-icon">mdi-help-circle-outline</v-icon></template>
                    Not identified
                </v-chip>
            </v-col>

            <v-col cols="12" md="" class="d-flex align-center justify-end ga-2">
                <v-progress-circular
                    v-if="isLoading"
                    indeterminate
                    size="18"
                    width="2"
                    color="primary"
                />
                <span class="text-caption text-medium-emphasis">
                    {{ filteredTotal.toLocaleString() }} of {{ totalCount.toLocaleString() }} peptides
                </span>
            </v-col>
        </v-row>

        <!-- ── Data table ─────────────────────────────────────────────────────── -->
        <v-data-table-server
            mobile-breakpoint="md"
            :headers="headers"
            :items="shownItems"
            :items-per-page="5"
            :items-length="filteredTotal"
            density="compact"
            style="background-color: transparent"
            @update:options="refresh"
        >
            <template #no-data>
                <v-alert
                    class="ma-3"
                    density="compact"
                    type="info"
                    variant="tonal"
                    text="No peptides found"
                />
            </template>

            <template #item.peptide="{ item }">
                <v-tooltip location="top" :text="item.peptide">
                    <template #activator="{ props }">
                        <a
                            class="cursor-pointer"
                            @click="openPeptideAnalysis(item.peptide)"
                            :style="$vuetify.display.mobile ? 'display: inline-block; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;' : ''"
                        >
                            {{ item.peptide }}
                        </a>
                    </template>
                </v-tooltip>
            </template>

            <template #item.lca="{ item }">
                <v-tooltip location="top" :text="item.lca">
                    <template #activator="{ props }">
                    <span
                        v-bind="props"
                        style="display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                    >
                        {{ item.lca }}
                    </span>
                    </template>
                </v-tooltip>
            </template>

            <template #item.faCounts="{ item }">
                <v-tooltip v-if="item.faCounts" location="top">
                    <template #activator="{ props }">
                        <v-avatar
                            v-bind="props"
                            size="30"
                            :color="item.faCounts.go > 0 ? 'amber' : 'amber-lighten-4'"
                            class="me-1"
                        >
                            <span
                                :class="[ item.faCounts.go > 0 ? 'text-black' : 'text-grey', 'headline']"
                                style="font-size: 14px !important;"
                            >
                                GO
                            </span>
                        </v-avatar>
                    </template>

                    <span v-if="item.faCounts.go > 0">
                        This peptide is annotated with {{ item.faCounts.go }}
                        <span class="font-weight-bold">
                            {{ item.faCounts.go === 1 ? "GO-term" : "GO-terms" }}.
                        </span>
                    </span>
                    <span v-else>This peptide is not annotated with GO-terms.</span>
                </v-tooltip>

                <v-tooltip v-if="item.faCounts" location="top">
                    <template #activator="{ props }">
                        <v-avatar
                            v-bind="props"
                            size="30"
                            :color="item.faCounts.ec > 0 ? 'indigo' : 'indigo-lighten-4'"
                            class="me-1"
                        >
                            <span class="text-white" style="font-size: 14px !important;">EC</span>
                        </v-avatar>
                    </template>

                    <span v-if="item.faCounts.ec > 0">
                        This peptide is annotated with {{ item.faCounts.ec }}
                        <span class="font-weight-bold">
                            {{ item.faCounts.ec === 1 ? "EC-number" : "EC-numbers" }}.
                        </span>
                    </span>
                    <span v-else>This peptide is not annotated with EC-numbers.</span>
                </v-tooltip>

                <v-tooltip v-if="item.faCounts" location="top">
                    <template #activator="{ props }">
                        <v-avatar
                            v-bind="props"
                            size="30"
                            :color="item.faCounts.ipr > 0 ? 'red' : 'red-lighten-4'"
                        >
                            <span class="text-white" style="font-size: 14px !important;">IPR</span>
                        </v-avatar>
                    </template>

                    <span v-if="item.faCounts.ipr > 0">
                        This peptide is annotated with {{ item.faCounts.ipr }}
                        <span class="font-weight-bold">
                            {{ item.faCounts.ipr === 1 ? "InterPro-entry" : "InterPro-entries" }}.
                        </span>
                    </span>
                    <span v-else>This protein is not annotated with InterPro-entries.</span>
                </v-tooltip>
            </template>

        <template #item.status="{ item }">
            <v-tooltip location="top">
                <template #activator="{ props }">
                    <v-avatar
                        v-bind="props"
                        size="30"
                        color="transparent"
                        :style="item.found ? 'border: 2px solid rgb(var(--v-theme-success));' : 'border: 2px solid #C8E6C9;'"
                        class="me-1"
                    >
                        <v-icon
                            size="18"
                            :class="item.found ? 'text-success' : 'text-green-lighten-4'"
                            :icon="item.found ? 'mdi-database' : 'mdi-database-alert'"
                        />
                    </v-avatar>
                </template>
                <span v-if="item.found">Peptide was found by Unipept.</span>
                <span v-else>This peptide was not found by Unipept.</span>
            </v-tooltip>

            <v-tooltip location="top">
                <template #activator="{ props }">
                    <v-avatar
                        v-bind="props"
                        size="30"
                        color="transparent"
                        :style="item.cutoffUsed ? 'border: 2px solid #FFC107;' : 'border: 2px solid #FFECB3;'"
                        class="me-1"
                    >
                        <v-icon
                            size="18"
                            :class="item.cutoffUsed ? 'text-amber' : 'text-amber-lighten-4'"
                            :icon="item.cutoffUsed ? 'mdi-gauge-full' : 'mdi-gauge-low'"
                        />
                    </v-avatar>
                </template>
                <div style="max-width: 500px">
                    <span v-if="item.cutoffUsed">
                        Protein match cutoff exceeded for this peptide. Results are based on a subset of matching proteins and may not be fully representative.
                    </span>
                    <span v-else>Protein match cutoff not exceeded for this peptide. All matching proteins were included for the analysis of this peptide.</span>
                </div>
            </v-tooltip>

            <v-tooltip v-if="analysis.config.useCrap" location="top">
                <template #activator="{ props }">
                    <v-avatar
                        v-bind="props"
                        size="30"
                        color="transparent"
                        :style="item.crapFiltered ? 'border: 2px solid #F44336;' : 'border: 2px solid #FFCDD2;'"
                    >
                        <v-icon
                            size="18"
                            :class="item.crapFiltered ? 'text-red' : 'text-red-lighten-4'"
                            :icon="item.crapFiltered ? 'mdi-filter-minus' : 'mdi-filter'"
                        />
                    </v-avatar>
                </template>
                <span v-if="item.crapFiltered">This peptide was filtered out by the cRAP filter and excluded from the analysis.</span>
                <span v-else>This peptide was not filtered by the cRAP filter.</span>
            </v-tooltip>
        </template>
    </v-data-table-server>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { SingleAnalysisStore } from "@/store/SingleAnalysisStore";
import { useTableSortFilter } from "@/composables/useTableSortFilter";

const { analysis } = defineProps<{
    analysis: SingleAnalysisStore
}>();

const {
    search,
    quickFilters,
    shownItems,
    filteredTotal,
    totalCount,
    isLoading,
    refresh,
    onSearchInput,
    onQuickFilterChange
} = useTableSortFilter(analysis);

// ── Search hints dropdown ─────────────────────────────────────────────────────

interface SearchHint {
    query:       string;
    color?:      string;
    description: string;
}

const searchHints: SearchHint[] = [
    { query: "sus scrofa",           color: "green",  description: "Free text — matched against the LCA name column" },
    { query: "rank:species",         color: "blue",   description: "Filter by taxonomic rank" },
    { query: "has:go",               color: "amber",  description: "Show only peptides with GO annotations" },
    { query: "has:ec",               color: "indigo", description: "Show only peptides with EC numbers" },
    { query: "lca:homo sapiens",     color: "teal",   description: "Multi-word LCA filter (supports partial match)" },
    { query: "rank:species has:go",  color: undefined, description: "Combine multiple filters" },
];

const hintsOpen = ref(false);
let blurTimeout: ReturnType<typeof setTimeout> | null = null;

const onSearchFocus = () => {
    if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
    hintsOpen.value = !search.value;
};

const onSearchBlur = () => {
    blurTimeout = setTimeout(() => { hintsOpen.value = false; }, 150);
};

const handleSearchInput = (value: string | null) => {
    onSearchInput(value);
    hintsOpen.value = !value;
};

const handleClear = () => {
    onSearchInput("");
    hintsOpen.value = true;
};

const applyHint = (query: string) => {
    if (blurTimeout) { clearTimeout(blurTimeout); blurTimeout = null; }
    onSearchInput(query);
    hintsOpen.value = false;
};

onBeforeUnmount(() => {
    if (blurTimeout) clearTimeout(blurTimeout);
});
</script>

<script lang="ts">
import type { DataTableHeader } from "vuetify";

const headers: DataTableHeader[] = [
    {
        title: "Peptide",
        align: "start",
        key: "peptide",
        width: "25%",
        maxWidth: "25%",
        cellProps: { style: "max-width: 0; overflow: hidden;" }
    },
    {
        title: "Occurrence",
        align: "start",
        key: "occurrence",
        width: "10%"
    },
    {
        title: "Lowest common ancestor",
        align: "start",
        key: "lca",
        width: "25%",
        maxWidth: "25%",
        cellProps: { style: "max-width: 0; overflow: hidden;" }
    },
    {
        title: "Rank",
        align: "start",
        key: "rank",
        width: "15%"
    },
    {
        title: "Annotations",
        align: "start",
        key: "faCounts",
        width: "15%",
        sortable: false
    },
    {
        title: "Status",
        align: "center",
        key: "status",
        width: "10%",
        sortable: false
    }
];

export type { AnalysisSummaryTableItem } from "@/composables/useTableSortFilter";

const openPeptideAnalysis = (peptide: string) => {
    // TODO: change this. Hardcoded link to website for testing purposes
    const a = document.createElement("a");
    a.href = `https://unipept.ugent.be/spa/${peptide}?equate=${true}`;
    a.target = "_blank";
    a.click();
};
</script>

<style scoped>
a {
    color: #2196f3;
    text-decoration: none;
}

a:hover {
    text-decoration: none;
}

/* Lighter border for inactive (outlined) quick filter chips */
:deep(.v-chip--variant-outlined) {
    border-color: rgba(0, 0, 0, 0.18) !important;
}

/* Align prepend icons vertically with chip text */
:deep(.chip-icon) {
    font-size: 14px !important;
    line-height: 1 !important;
    align-self: center !important;
    margin-inline-end: 4px;
}

/* Search hints dropdown */
.hints-dropdown {
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    right: 0;
    z-index: 2400;
}

.hints-header {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.45);
}

.hint-item {
    cursor: pointer;
}

.hint-query {
    font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace;
    font-size: 13px;
    min-width: 160px;
    display: inline-block;
}
</style>

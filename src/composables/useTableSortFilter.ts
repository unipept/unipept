import { computed, ref, toRaw, watch } from "vue";
import { markRaw } from "vue";
import { ShareableMap, TransferableState } from "shared-memory-datastructures";
import type { SingleAnalysisStore } from "@/store/SingleAnalysisStore";
import TableSortFilterWebWorker from "@/composables/processing/workers/tableSortFilter.worker.ts?worker&inline";
import useAsyncWebWorker from "@/composables/useAsyncWebWorker";

// ─── Shared types (also imported by the worker) ───────────────────────────────

export interface AnalysisSummaryTableItem {
    peptide:    string;
    occurrence: number;
    lca:        string;
    rank:       string;
    found:      boolean;
    faCounts:   { all: number; ec: number; go: number; ipr: number } | undefined;
}

export interface NcbiSubsetEntry {
    name: string;
    rank: string;
}

export interface QuickFilters {
    speciesLevel: boolean;  // ncbiEntry.rank === "species"
    hasGo:        boolean;  // go count > 0
    hasEc:        boolean;  // ec count > 0
    hasIpr:       boolean;  // ipr count > 0
    notFound:     boolean;  // peptide not matched by Unipept
}

export interface TableSortFilterWorkerInput {
    /** TransferableState of peptidesTable.counts — zero-copy via SharedArrayBuffer */
    peptideCountsTransferable:  TransferableState;
    /** TransferableState of peptideToData — zero-copy via SharedArrayBuffer */
    peptideToDataTransferable:  TransferableState;
    /** TransferableState of a ShareableMap built once from the plain peptideToLca Map */
    peptideToLcaTransferable:   TransferableState;
    /** Tiny NCBI name/rank subset for unique LCA ids — structured-cloned (small) */
    ncbiSubset:                 Record<number, NcbiSubsetEntry>;
    search:       string;
    quickFilters: QuickFilters;
    sortKey:      string;
    sortOrder:    "asc" | "desc" | "";
    page:         number;
    itemsPerPage: number;
}

export interface TableSortFilterWorkerOutput {
    rows:       AnalysisSummaryTableItem[];
    totalCount: number;
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useTableSortFilter(analysis: SingleAnalysisStore) {
    // ── Reactive filter / sort / pagination state (bound to UI controls) ──
    const search       = ref("");
    const quickFilters = ref<QuickFilters>({ speciesLevel: false, hasGo: false, hasEc: false, hasIpr: false, notFound: false });
    const page         = ref(1);
    const itemsPerPage = ref(5);
    const sortKey      = ref("");
    const sortOrder    = ref<"asc" | "desc" | "">("");

    // ── Reactive output state ─────────────────────────────────────────────
    const shownItems    = ref<AnalysisSummaryTableItem[]>([]);
    const filteredTotal = ref(0);
    const isLoading     = ref(false);

    // ── Unfiltered total — cheap size read, no worker needed ─────────────
    const totalCount = computed(() => analysis.peptidesTable?.counts.size ?? 0);

    // ── Per-analysis caches (rebuilt whenever analysis data changes) ──────
    let peptideToLcaShareable: ShareableMap<string, number> | null = null;
    let ncbiSubset: Record<number, NcbiSubsetEntry> | null = null;

    const { post } = useAsyncWebWorker<
        TableSortFilterWorkerInput,
        TableSortFilterWorkerOutput
    >(() => new TableSortFilterWebWorker());

    // ── Stale-result guard ────────────────────────────────────────────────
    let currentRequestId = 0;

    // ── Cache builder ─────────────────────────────────────────────────────
    const buildCaches = () => {
        const lcaMap = analysis.peptideToLca;
        if (!lcaMap || !lcaMap.size) return;

        const shareable = new ShareableMap<string, number>({ expectedSize: lcaMap.size });
        for (const [peptide, lcaId] of lcaMap) {
            shareable.set(peptide, lcaId);
        }
        peptideToLcaShareable = markRaw(shareable);

        const { ncbiOntology } = analysis.ontologyStore;
        const subset: Record<number, NcbiSubsetEntry> = {};
        for (const lcaId of lcaMap.values()) {
            if (!(lcaId in subset)) {
                const entry = ncbiOntology.get(lcaId);
                if (entry) {
                    subset[lcaId] = { name: entry.name, rank: entry.rank };
                }
            }
        }
        ncbiSubset = subset;
    };

    // ── Worker invocation ─────────────────────────────────────────────────
    const runWorker = async () => {
        if (
            !analysis.peptidesTable  ||
            !analysis.peptideToData  ||
            !peptideToLcaShareable   ||
            !ncbiSubset
        ) return;

        const myId = ++currentRequestId;
        isLoading.value = true;

        try {
            const result = await post({
                peptideCountsTransferable: analysis.peptidesTable.counts.toTransferableState(),
                peptideToDataTransferable: analysis.peptideToData.toTransferableState(),
                peptideToLcaTransferable:  peptideToLcaShareable.toTransferableState(),
                ncbiSubset: toRaw(ncbiSubset),
                search:       search.value,
                quickFilters: toRaw(quickFilters.value),
                sortKey:      sortKey.value,
                sortOrder:    sortOrder.value,
                page:         page.value,
                itemsPerPage: itemsPerPage.value
            });

            if (myId !== currentRequestId) return;

            shownItems.value    = result.rows;
            filteredTotal.value = result.totalCount;
        } finally {
            if (myId === currentRequestId) {
                isLoading.value = false;
            }
        }
    };

    // ── Debounce helpers ──────────────────────────────────────────────────
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleWorker = (delayMs = 100) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(runWorker, delayMs);
    };

    // ── Public API ────────────────────────────────────────────────────────

    /** Called by v-data-table-server's @update:options event */
    const refresh = (params: {
        page?:         number;
        itemsPerPage?: number;
        sortBy?:       { key: string; order: "asc" | "desc" }[];
    }) => {
        if (params.page         !== undefined) page.value         = params.page;
        if (params.itemsPerPage !== undefined) itemsPerPage.value = params.itemsPerPage;

        if (params.sortBy !== undefined) {
            if (params.sortBy.length > 0) {
                sortKey.value   = params.sortBy[0].key;
                sortOrder.value = params.sortBy[0].order;
            } else {
                sortKey.value   = "";
                sortOrder.value = "";
            }
        }

        scheduleWorker();
    };

    /** Debounced (300 ms) handler for the search text field */
    const onSearchInput = (value: string | null) => {
        search.value = value ?? "";
        page.value   = 1;
        scheduleWorker(300);
    };

    // Query strings that correspond to each chip (chips without an entry here are chip-only filters)
    const CHIP_QUERIES: Partial<Record<keyof QuickFilters, string>> = {
        speciesLevel: "rank:species",
        hasGo:        "has:go",
        hasEc:        "has:ec",
        hasIpr:       "has:ipr",
    };

    /** Immediate handler for quick filter chip toggles */
    const onQuickFilterChange = (filters: QuickFilters) => {
        quickFilters.value = filters;

        // Rebuild the search bar from the set of active chip queries
        search.value = (Object.entries(CHIP_QUERIES) as [keyof QuickFilters, string][])
            .filter(([key]) => filters[key])
            .map(([, query]) => query)
            .join(" ");

        page.value = 1;
        scheduleWorker();
    };

    // ── React to new analysis data ────────────────────────────────────────
    watch(
        () => analysis.peptidesTable,
        () => {
            buildCaches();
            page.value = 1;
            scheduleWorker();
        },
        { immediate: true }
    );

    return {
        // State bindings
        search,
        quickFilters,
        shownItems,
        filteredTotal,
        totalCount,
        isLoading,

        // Event handlers
        refresh,
        onSearchInput,
        onQuickFilterChange
    };
}

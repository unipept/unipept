import { ShareableMap } from "shared-memory-datastructures";
import type { AnalysisSummaryTableItem, TableSortFilterWorkerInput, TableSortFilterWorkerOutput } from "../../useTableSortFilter";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";

self.onunhandledrejection = (event) => {
    throw event.reason;
};

self.onmessage = (event) => {
    self.postMessage(process(event.data));
};

// ─── Query parser ─────────────────────────────────────────────────────────────

interface ParsedQuery {
    freeText:   string;
    rankFilter: string;
    lcaFilter:  string;
    hasGo:      boolean;
    hasEc:      boolean;
    hasIpr:     boolean;
    hasAny:     boolean;
}

/**
 * Parses a search string into structured filter parts.
 *
 * Supported syntax:
 *   rank:species       — filter by taxonomic rank (substring match)
 *   lca:sus scrofa     — filter by LCA name (multi-word, substring match)
 *   has:go             — require GO annotations
 *   has:ec             — require EC annotations
 *   has:ipr            — require InterPro annotations
 *   has:annotation(s)  — require any functional annotation
 *
 * Remaining tokens after extracting key:value pairs become freeText,
 * which is matched as a substring against the peptide sequence.
 */
const parseQuery = (search: string): ParsedQuery => {
    const result: ParsedQuery = {
        freeText: "", rankFilter: "", lcaFilter: "",
        hasGo: false, hasEc: false, hasIpr: false, hasAny: false
    };

    const trimmed = search.trim();
    if (!trimmed) return result;

    // Match key:value tokens where the value extends until the next key:value pair or end.
    // The negative lookahead (?!\w+:) prevents consuming the start of the next key:value token.
    const keyValueRe = /(\w+):((?:\S+)(?:\s+(?!\w+:)\S+)*)/g;
    const freeTextParts: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = keyValueRe.exec(trimmed)) !== null) {
        const before = trimmed.slice(lastIndex, match.index).trim();
        if (before) freeTextParts.push(before);
        lastIndex = match.index + match[0].length;

        const key   = match[1].toLowerCase();
        const value = match[2].trim().toLowerCase();

        switch (key) {
            case "rank": result.rankFilter = value; break;
            case "lca":  result.lcaFilter  = value; break;
            case "has":
                if (value === "go")                                  result.hasGo  = true;
                else if (value === "ec")                             result.hasEc  = true;
                else if (value === "ipr")                            result.hasIpr = true;
                else if (value === "annotation" || value === "annotations") result.hasAny = true;
                break;
        }
    }

    const after = trimmed.slice(lastIndex).trim();
    if (after) freeTextParts.push(after);

    result.freeText = freeTextParts.join(" ").toLowerCase();
    return result;
};

// ─── Main processing function ─────────────────────────────────────────────────

const process = ({
    peptideCountsTransferable,
    peptideToDataTransferable,
    peptideToLcaTransferable,
    ncbiSubset,
    search,
    quickFilters,
    sortKey,
    sortOrder,
    page,
    itemsPerPage
}: TableSortFilterWorkerInput): TableSortFilterWorkerOutput => {
    const peptideCounts = ShareableMap.fromTransferableState<string, number>(
        peptideCountsTransferable
    );
    const peptideToData = ShareableMap.fromTransferableState<string, PeptideData>(
        peptideToDataTransferable,
        { serializer: new PeptideDataSerializer() }
    );
    const peptideToLca = ShareableMap.fromTransferableState<string, number>(
        peptideToLcaTransferable
    );

    const query = parseQuery(search);

    const rows: TableSortFilterWorkerOutput["rows"] = [];

    for (const [peptide, count] of peptideCounts.entries()) {
        // ── Free-text filter (peptide sequence) ──────────────────────────────
        if (query.freeText && !peptide.toLowerCase().includes(query.freeText)) {
            continue;
        }

        const lcaId      = peptideToLca.get(peptide);
        const ncbiEntry  = lcaId !== undefined ? ncbiSubset[lcaId] : undefined;
        const peptideData = peptideToData.get(peptide);
        const faCounts   = peptideData?.faCounts;

        // ── LCA name filter ───────────────────────────────────────────────────
        if (query.lcaFilter) {
            const lcaName = ncbiEntry?.name.toLowerCase() ?? "";
            if (!lcaName.includes(query.lcaFilter)) continue;
        }

        // ── Rank filter ───────────────────────────────────────────────────────
        if (query.rankFilter) {
            const rank = ncbiEntry?.rank.toLowerCase() ?? "";
            if (!rank.includes(query.rankFilter)) continue;
        }

        // ── has: query filters ────────────────────────────────────────────────
        if (query.hasGo  && (!faCounts || faCounts.go  === 0)) continue;
        if (query.hasEc  && (!faCounts || faCounts.ec  === 0)) continue;
        if (query.hasIpr && (!faCounts || faCounts.ipr === 0)) continue;
        if (query.hasAny && (!faCounts || (faCounts.go === 0 && faCounts.ec === 0 && faCounts.ipr === 0))) continue;

        // ── Quick filter chips ────────────────────────────────────────────────
        if (quickFilters.speciesLevel && ncbiEntry?.rank !== "species") continue;
        if (quickFilters.hasGo          && (!faCounts || faCounts.go  === 0)) continue;
        if (quickFilters.hasEc          && (!faCounts || faCounts.ec  === 0)) continue;
        if (quickFilters.hasIpr         && (!faCounts || faCounts.ipr === 0)) continue;
        if (quickFilters.notFound       && lcaId !== undefined) continue;

        rows.push({
            peptide,
            occurrence: count,
            lca:   ncbiEntry?.name ?? "N/A",
            rank:  ncbiEntry?.rank ?? "N/A",
            found: lcaId !== undefined,
            faCounts
        });
    }

    // ── Sort ─────────────────────────────────────────────────────────────────
    if (sortKey && sortOrder) {
        const dir = sortOrder === "asc" ? 1 : -1;

        rows.sort((a: AnalysisSummaryTableItem, b: AnalysisSummaryTableItem) => {
            let valA: string | number;
            let valB: string | number;

            if (sortKey === "faCounts") {
                valA = a.faCounts?.all ?? 0;
                valB = b.faCounts?.all ?? 0;
            } else {
                valA = (a as Record<string, any>)[sortKey];
                valB = (b as Record<string, any>)[sortKey];
            }

            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();

            if (valA < valB) return -dir;
            if (valA > valB) return  dir;
            return 0;
        });
    }

    const totalCount = rows.length;

    // ── Paginate ─────────────────────────────────────────────────────────────
    const start = (page - 1) * itemsPerPage;
    const end   = itemsPerPage === -1 ? totalCount : start + itemsPerPage;

    return {
        rows: rows.slice(start, end),
        totalCount
    };
};

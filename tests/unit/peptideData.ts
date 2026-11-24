import { ShareableMap, TransferableState } from "shared-memory-datastructures";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";

export interface TestPeptide {
    lca?: number;
    // Number of proteins with each annotation type: all, EC, GO and IPR
    proteinCounts?: { all: number, EC: number, GO: number, IPR: number };
    // Number of proteins per annotation code, for example { "EC:1.1.1.1": 3 }
    annotations?: Record<string, number>;
    // The first ranks of the lineage; the other ranks are null
    lineage?: (number | null)[];
    cutoffUsed?: boolean;
}

// Builds the PeptideData that the API would return for one peptide
export function peptideData({
    lca = 1,
    proteinCounts = { all: 0, EC: 0, GO: 0, IPR: 0 },
    annotations = {},
    lineage = [],
    cutoffUsed = false
}: TestPeptide = {}) {
    return PeptideData.createFromPeptideDataResponse({
        lca,
        lineage: [...lineage, ...Array(27 - lineage.length).fill(null)],
        fa: { counts: proteinCounts, data: annotations },
        taxa: [],
        cutoff_used: cutoffUsed,
        crap_filtered: false,
    });
}

// Serializes peptide data the way the workers receive it
export function peptideDataTransferable(peptides: Record<string, TestPeptide>): TransferableState {
    const map = new ShareableMap<string, PeptideData>({ serializer: new PeptideDataSerializer() });
    for (const [peptide, data] of Object.entries(peptides)) {
        map.set(peptide, peptideData(data));
    }
    return map.toTransferableState();
}

export function countsTransferable(counts: Record<string, number>): TransferableState {
    const map = new ShareableMap<string, number>();
    for (const [peptide, count] of Object.entries(counts)) {
        map.set(peptide, count);
    }
    return map.toTransferableState();
}

export function fromTransferable<K, V>(state: TransferableState): Map<K, V> {
    return new Map(ShareableMap.fromTransferableState<K, V>(state).entries());
}

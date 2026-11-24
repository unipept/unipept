import {ShareableMap, TransferableState} from "shared-memory-datastructures";

export interface PeptideProcessorData {
    peptides: string[];
    filter: boolean;
}

export interface PeptideProcessorWorkerOutput {
    peptideCountsTransferable: TransferableState;
    totalPeptideCount: number;
}

export const countPeptides = async ({
    peptides,
    filter
}: PeptideProcessorData) => {
    peptides = preprocess(peptides);

    const peptideCounts = new ShareableMap<string, number>();
    for (const peptide of peptides) {
        const count = peptideCounts.get(peptide) || 0;
        peptideCounts.set(peptide, filter ? 1 : count + 1);
    }

    const totalPeptideCount = Array.from(peptideCounts.values()).reduce((a, b) => a + b, 0);

    return {
        peptideCountsTransferable: peptideCounts.toTransferableState(),
        totalPeptideCount
    };
}

const preprocess = (
    peptides: string[]
) => {
    return peptides
        .filter((p) => p.length >= 5);
}

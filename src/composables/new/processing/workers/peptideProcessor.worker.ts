import {PeptideProcessorData} from "@/composables/new/processing/peptide/usePeptideProcessor";

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async ({
    peptides,
    equate,
    filter
}: PeptideProcessorData) => {
    peptides = preprocess(peptides, equate);

    const peptideCounts = new Map<string, number>();
    for (const peptide of peptides) {
        const count = peptideCounts.get(peptide) || 0;
        peptideCounts.set(peptide, filter ? 1 : count + 1);
    }

    const totalPeptideCount = peptideCounts.values().reduce((a, b) => a + b, 0);

    return {
        peptideCounts,
        totalPeptideCount
    };
}

const preprocess = (
    peptides: string[],
    equate: boolean
) => {
    return peptides
        .filter((p) => p.length >= 5)
        .map(p => equate ? p.replace(/I/g, 'L') : p);
}

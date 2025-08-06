import {PeptideProcessorData} from "@/composables/processing/peptide/usePeptideProcessor";
import {ShareableMap} from "shared-memory-datastructures";

self.onunhandledrejection = (event) => {
    // This will propagate to the main thread's `onerror` handler
    throw event.reason;
};

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async ({
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

import {ShareableMap} from "shared-memory-datastructures";
import {FunctionalProcessorData} from "@/composables/processing/functional/useFunctionalProcessor";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";
import PeptideData from "@/logic/ontology/peptides/PeptideData";

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async ({
    countsMapTransferable,
    peptideDataTransferable,
    percentage,
    termPrefix,
    proteinCountProperty
}: FunctionalProcessorData ) => {
    const peptideToResponseMap = ShareableMap.fromTransferableState<string, PeptideData>(peptideDataTransferable, { serializer: new PeptideDataSerializer()});
    const peptideCounts = ShareableMap.fromTransferableState<string, number>(countsMapTransferable);

    // First we count the amount of peptides per unique code. Afterwards, we can fetch definitions for all these
    // terms and split them on namespace.
    const countsPerCode = new ShareableMap<string, number>();
    // Keeps track of how many peptides are associated with at least one annotation
    let annotatedCount = 0;

    const itemToPeptides: Map<string, string[]> = new Map();

    for (const [peptide, peptideCount] of peptideCounts) {
        const peptideData = peptideToResponseMap.get(peptide);

        if (!peptideData) {
            continue;
        }

        const proteinCount: number = peptideData.faCounts[proteinCountProperty];
        // @ts-ignore peptide data comes straight from Unipept API
        const terms: Map<string, number> = peptideData[termPrefix] as Map<string, number>;

        for (const [term, proteinCountOfTerm] of Object.entries(terms)) {
            if ((proteinCountOfTerm / proteinCount) * 100 > percentage) {
                countsPerCode.set(term, (countsPerCode.get(term) || 0) + peptideCount);
            }

            if (!itemToPeptides.has(term)) {
                itemToPeptides.set(term, []);
            }
            itemToPeptides.get(term)!.push(peptide);
        }

        // If there is at least one protein that belongs to this peptide annotated with an annotation of the
        // kind we're currently investigating, we should increase the annotation count.
        if (proteinCount > 0) {
            annotatedCount += peptideCount;
        }
    }



    // Counts per code is guaranteed to be sorted by count (note that JS Maps return values in the order they were
    // inserted!)
    // const sortedCounts: Map<string, number> = new Map([...countsPerCode].sort(
    //     ([code1, count1]: [string, number], [code2, count2]: [string, number]) => count2 - count1
    // ));

    return {
        sortedCountsTransferable: countsPerCode.toTransferableState(),
        itemToPeptides,
        annotatedCount
    };
};

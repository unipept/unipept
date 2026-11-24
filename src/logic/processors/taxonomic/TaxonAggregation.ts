import {ShareableMap, TransferableState} from "shared-memory-datastructures";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";
import PeptideData from "@/logic/ontology/peptides/PeptideData";

export interface TaxonAggregationInput {
    peptideCounts: Map<string, number>;
    peptideDataTransferable: TransferableState;
}

export interface TaxonAggregationOutput {
    countsPerLcaTransferable: TransferableState;
    lcaToPeptides: Map<number, string[]>;
    peptideToLca: Map<string, number>;
    annotatedCount: number;
}

export const aggregateTaxa = async ({
   peptideCounts,
   peptideDataTransferable
}: TaxonAggregationInput): Promise<TaxonAggregationOutput> => {
    const peptideToResponseMap = ShareableMap.fromTransferableState<string, PeptideData>(peptideDataTransferable, { serializer: new PeptideDataSerializer()});

    const countsPerLca = new Map<number, number>();
    const lcaToPeptides: Map<number, string[]> = new Map();
    const peptideToLca: Map<string, number> = new Map();
    let annotatedCount = 0;

    for (const [peptide, peptideCount] of peptideCounts) {
        const peptideData = peptideToResponseMap.get(peptide);

        if (!peptideData) {
            continue;
        }

        const lca = peptideData.lca;
        countsPerLca.set(lca, (countsPerLca.get(lca) || 0) + peptideCount);
        peptideToLca.set(peptide, lca);

        if (!lcaToPeptides.has(lca)) {
            lcaToPeptides.set(lca, []);
        }
        lcaToPeptides.get(lca)!.push(peptide);

        annotatedCount += peptideCount;
    }

    const countsShareableMap = new ShareableMap<number, number>();
    for (const [lca, count] of countsPerLca) {
        countsShareableMap.set(lca, count);
    }

    return {
        countsPerLcaTransferable: countsShareableMap.toTransferableState(),
        lcaToPeptides,
        peptideToLca,
        annotatedCount
    };
};

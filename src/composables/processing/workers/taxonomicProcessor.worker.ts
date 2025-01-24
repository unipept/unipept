import {ShareableMap} from "shared-memory-datastructures";
import {PeptideData, PeptideDataSerializer} from "unipept-web-components";
import {TaxonomicProcessorData} from "@/composables/processing/taxonomic/useTaxonomicProcessor";

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
}

const process = async ({
   peptideCounts,
   indexBuffer,
   dataBuffer
}: TaxonomicProcessorData ) => {
    const peptideToResponseMap = new ShareableMap<string, PeptideData>(
        0, 0, new PeptideDataSerializer()
    );
    peptideToResponseMap.setBuffers(indexBuffer, dataBuffer);

    const countsPerLca: Map<number, number> = new Map();
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
        lcaToPeptides.get(lca).push(peptide);

        annotatedCount += peptideCount;
    }

    return {
        countsPerLca,
        lcaToPeptides,
        peptideToLca,
        annotatedCount
    };
};

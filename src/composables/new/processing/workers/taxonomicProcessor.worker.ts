import {ShareableMap} from "shared-memory-datastructures";
import {PeptideData, PeptideDataSerializer} from "unipept-web-components";
import {TaxonomicProcessorData} from "@/composables/new/processing/taxonomic/useTaxonomicProcessor";

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

    const countsPerLca: Map<NcbiId, number> = new Map();
    const lcaToPeptides: Map<NcbiId, string[]> = new Map();

    for (const peptide of peptideCounts.keys()) {
        const peptideCount = peptideCounts.getOrDefault(peptide);
        const peptideData = peptideToResponseMap.get(peptide);

        if (!peptideData) {
            continue;
        }

        const lca = peptideData.lca;
        countsPerLca.set(lca, (countsPerLca.get(lca) || 0) + peptideCount);

        if (!lcaToPeptides.has(lca)) {
            lcaToPeptides.set(lca, []);
        }

        lcaToPeptides.get(lca).push(peptide);
    }

    return {
        countsPerLca,
        lcaToPeptides
    };
};

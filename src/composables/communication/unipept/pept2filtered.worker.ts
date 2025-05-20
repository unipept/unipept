import {ShareableMap} from "shared-memory-datastructures";
import {Pept2filteredData} from "@/composables/communication/unipept/usePept2filtered";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";
import {parallelLimit} from "async";
import {Filter, FilterType} from "@/store/CustomFilterStore";

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
};

const process = async ({
    peptides,
    equate,
    filter,
    baseUrl,
    batchSize,
    parallelRequests
}: Pept2filteredData) => {
    const result = new ShareableMap<string, PeptideData>({ serializer: new PeptideDataSerializer() });

    const requests = [];
    for (let i = 0; i < peptides.length; i += batchSize) {
        requests.push(async () => {
            const response = await fetch(`${baseUrl}/mpa/pept2data`, {
                method: "POST",
                body: JSON.stringify({
                    peptides: peptides.slice(i, i + batchSize),
                    equate_il: equate,
                    report_taxa: true,
                    ...constructFilterJson(filter)
                }),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json());

            for (const peptide of response.peptides) {
                result.set(peptide.sequence, PeptideData.createFromPeptideDataResponse(peptide));
            }
        });
    }

    await parallelLimit(requests, parallelRequests);

    return {
        peptToDataTransferable: result.toTransferableState()
    };
}


const constructFilterJson = (filter: Filter | undefined) => {
    if (!filter) return {};

    switch (filter.filter) {
        case FilterType.Taxon: return { filter: { taxa: filter.data } };
        case FilterType.Proteome: return { filter: { proteomes: filter.data } };
        case FilterType.Protein: return { filter: { proteins: filter.data } };
        case FilterType.UniProtKB:
        default: return {}
    }
}
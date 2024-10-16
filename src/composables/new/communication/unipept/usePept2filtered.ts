import {ShareableMap} from "shared-memory-datastructures";
import {PeptideData, PeptideDataSerializer} from "unipept-web-components";
import { parallelLimit } from "async";

export default function usePept2filtered(
    baseUrl = "https://api.unipept.ugent.be",
    batchSize = 100,
    parallelRequests = 5,
) {
    const process = async (
        peptides: string[],
        equate: boolean,
    ) => {
        const result = new ShareableMap<string, PeptideData>(undefined, undefined, new PeptideDataSerializer());

        // TODO: caching

        const requests = [];
        for(let i = 0; i < peptides.length; i += batchSize) {
            requests.push(async () => {
                const response = await fetch(`${baseUrl}/mpa/pept2data`, {
                    method: "POST",
                    body: JSON.stringify({ peptides, equate_il: equate }),
                    headers: { "Content-Type": "application/json" }
                }).then(r => r.json());

                for (const peptide of response.peptides) {
                    result.set(peptide.sequence, PeptideData.createFromPeptideDataResponse(peptide));
                }
            });
        }

        await parallelLimit(requests, parallelRequests);

        return result;
    }

    return {
        process
    }
}
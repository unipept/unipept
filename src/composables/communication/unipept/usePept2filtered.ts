import {ShareableMap} from "shared-memory-datastructures";
import {parallelLimit} from "async";
import {ref} from "vue";
import {DEFAULT_API_BASE_URL} from "@/logic/Constants";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import PeptideDataSerializer from "@/logic/ontology/peptides/PeptideDataSerializer";
import {Filter, FilterType} from "@/store/new/CustomFilterStore";

export default function usePept2filtered(
    baseUrl = DEFAULT_API_BASE_URL,
    batchSize = 400,
    parallelRequests = 5,
) {
    const peptideData = ref<ShareableMap<string, PeptideData>>();

    const process = async (
        peptides: string[],
        equate: boolean,
        filter: Filter
    ) => {
        const result = new ShareableMap<string, PeptideData>(undefined, undefined, new PeptideDataSerializer());

        // TODO: caching

        const requests = [];
        for(let i = 0; i < peptides.length; i += batchSize) {
            console.log(JSON.stringify({
                peptides: peptides.slice(i, i + batchSize),
                equate_il: equate,
                ...constructFilterJson(filter)
            }))
            requests.push(async () => {
                const response = await fetch(`${baseUrl}/mpa/pept2data`, {
                    method: "POST",
                    body: JSON.stringify({
                        peptides: peptides.slice(i, i + batchSize),
                        equate_il: equate,
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

        peptideData.value = result;
    }

    const constructFilterJson = (filter: Filter) => {
        switch (filter.filter) {
            case FilterType.Taxon: return { filter: { taxa: filter.data } };
            case FilterType.Proteome: return { filter: { proteomes: filter.data } };
            case FilterType.Protein: return { filter: { proteins: filter.data } };
            case FilterType.UniProtKB:
            default: return {}
        }
    }

    return {
        peptideData,

        process
    }
}

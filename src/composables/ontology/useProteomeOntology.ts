import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import ReferenceProteome from "@/logic/ontology/proteomes/ReferenceProteome";
import ProteomeCommunicator from "@/logic/communicators/unipept/proteome/ProteomeCommunicator";

export default function useProteomeOntology(
    baseUrl = DEFAULT_API_BASE_URL,
    batchSize = DEFAULT_ONTOLOGY_BATCH_SIZE
) {
    const ontology = new Map<string, ReferenceProteome>();

    const update = async(
        ids: string[]
    ) => {
        ids = ids.filter(id => !ontology.has(id));

        const proteomeCommunicator = new ProteomeCommunicator(baseUrl, batchSize);
        const responses = await proteomeCommunicator.getResponses(ids);

        for (const response of responses) {
            ontology.set(
                response.id,
                {
                    id: response.id,
                    taxonName: response.taxon_name,
                    taxonId: response.taxon_id,
                    proteinCount: response.protein_count
                }
            );
        }
    }

    return {
        ontology,
        update
    }
}

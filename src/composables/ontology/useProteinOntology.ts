import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import ProteinResponseCommunicator from "@/logic/communicators/unipept/protein/ProteinResponseCommunicator";
import Protein from "@/logic/ontology/proteins/Protein";

export default function useProteinOntology(
    baseUrl = DEFAULT_API_BASE_URL,
    batchSize = DEFAULT_ONTOLOGY_BATCH_SIZE
) {
    const ontology = new Map<string, Protein>();

    const update = async(
        ids: string[]
    ) => {
        ids = ids.filter(id => !ontology.has(id));

        const proteinCommunicator = new ProteinResponseCommunicator(baseUrl, batchSize);
        const responses = await proteinCommunicator.getResponses(ids);

        for (const response of responses) {
            ontology.set(response.uniprot_accession_id, {
                id: response.uniprot_accession_id,
                name: response.name,
                databaseType: response.db_type,
                taxonId: response.taxon_id,
                ecReferences: [],
                goReferences: [],
                interproReferences: []
            });
        }
    }

    return {
        ontology,
        update
    }
}
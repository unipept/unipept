import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import NcbiResponseCommunicator from "@/logic/communicators/unipept/taxonomic/NcbiResponseCommunicator";
import {NcbiTaxon} from "@/logic/ontology/taxonomic/Ncbi";

export default function useNcbiOntology(
    baseUrl = DEFAULT_API_BASE_URL,
    batchSize = DEFAULT_ONTOLOGY_BATCH_SIZE
) {
    const ontology = new Map<number, NcbiTaxon>();

    const update = async (
        ids: number[],
        withLineages = true
    ) => {
        ids = ids.filter(id => !ontology.has(id));

        const ncbiCommunicator = new NcbiResponseCommunicator(baseUrl, batchSize);
        const responses = await ncbiCommunicator.getResponses(ids);

        // Stores every taxon in the lineages of the requested taxa
        const lineageIds = [];
        for (const response of responses) {
            ontology.set(
                response.id,
                {
                    id: response.id,
                    name: response.name,
                    rank: response.rank,
                    lineage: response.lineage
                }
            );

            if (withLineages) {
                lineageIds.push(...response.lineage.filter((id: number) => id !== null && id !== -1).map((id: number) => Math.abs(id)));
            }
        }

        if (withLineages) {
            await update(lineageIds, false);
        }
    }

    return {
        ontology,
        update
    }
}

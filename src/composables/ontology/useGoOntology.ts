import GoResponseCommunicator from "@/logic/communicators/unipept/functional/GoResponseCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import {GoNamespace} from "@/logic/communicators/unipept/functional/GoResponse";
import {FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";

export default function useGoOntology(
    baseUrl = DEFAULT_API_BASE_URL,
    batchSize = DEFAULT_ONTOLOGY_BATCH_SIZE
) {
    const ontology = new Map<string, FunctionalDefinition<GoNamespace>>();

    const update = async (
        codes: string[]
    ) => {
        codes = codes.filter(c => !ontology.has(c));

        const goCommunicator = new GoResponseCommunicator(baseUrl, batchSize);
        const responses = await goCommunicator.getResponses(codes);

        for (const definition of responses) {
            ontology.set(
                definition.code,
                {
                    code: definition.code,
                    name: definition.name,
                    namespace: definition.namespace
                }
            );
        }
    }

    return {
        ontology,
        update
    }
}

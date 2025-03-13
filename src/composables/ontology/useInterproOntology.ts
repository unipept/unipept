import InterproResponseCommunicator from "@/logic/communicators/unipept/functional/InterproResponseCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import {InterproNamespace} from "@/logic/communicators/unipept/functional/InterproResponse";
import {FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";

export default function useInterproOntology(
    baseUrl = DEFAULT_API_BASE_URL,
    batchSize = DEFAULT_ONTOLOGY_BATCH_SIZE
) {
    const ontology = new Map<string, FunctionalDefinition<InterproNamespace>>();

    const update = async (
        codes: string[]
    ) => {
        codes = codes.filter(c => !ontology.has(c));

        const interproCommunicator = new InterproResponseCommunicator(baseUrl, batchSize);
        const responses = await interproCommunicator.getResponses(codes);

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

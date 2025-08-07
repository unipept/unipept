import EcResponseCommunicator from "@/logic/communicators/unipept/functional/EcResponseCommunicator";
import {DEFAULT_API_BASE_URL, DEFAULT_ONTOLOGY_BATCH_SIZE} from "@/logic/Constants";
import {FunctionalDefinition} from "@/logic/communicators/unipept/functional/FunctionalDefinition";
import {EcNamespace} from "@/logic/communicators/unipept/functional/EcResponse";
import {markRaw} from "vue";

export default function useEcOntology(
    baseUrl = DEFAULT_API_BASE_URL,
    batchSize = DEFAULT_ONTOLOGY_BATCH_SIZE
) {
    const ontology = new Map<string, FunctionalDefinition<EcNamespace>>();

    const update = async (
        codes: string[]
    ) => {
        codes = codes.filter(c => !ontology.has(c));

        const ecCommunicator = new EcResponseCommunicator(baseUrl, batchSize);
        const responses = await ecCommunicator.getResponses(codes);

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
        ontology: markRaw(ontology),
        update
    }
}

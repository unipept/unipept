import {ref} from "vue";
import {convertEcNumberToEcNamespace} from "@/logic/new/ontology/functional/ec/EcNamespace";

export default function useInterproOntology(
    baseUrl = "https://api.unipept.ugent.be",
    batchSize = 100
) {
    const ontology = ref<Map<string, { name: string, namespace: string }>>(new Map());

    const update = async (
        codes: string[]
    ) => {
        codes = codes.filter(c => !ontology.value.has(c));

        for(let i = 0; i < codes.length; i += batchSize) {
            const response = await fetch(`${baseUrl}/private_api/interpros`, {
                method: "POST",
                body: JSON.stringify({
                    interpros: codes.slice(i, i + batchSize).map(c => c.substring(4))
                }),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json());

            for (const definition of response) {
                ontology.value.set(
                    `IPR:${definition.code}`,
                    {
                        name: definition.name,
                        namespace: definition.category
                    }
                );
            }
        }
    }

    return {
        ontology,
        update
    }
}

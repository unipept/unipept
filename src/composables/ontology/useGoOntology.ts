import {ref} from "vue";
import FunctionalDefinition from "@/logic/ontology/functional/FunctionalDefinition";

export enum GoNamespace {
    BiologicalProcess = "biological process",
    CellularComponent = "cellular component",
    MolecularFunction = "molecular function"
}

export default function useGoOntology(
    baseUrl = "https://api.unipept.ugent.be",
    batchSize = 100
) {
    const ontology = new Map<string, FunctionalDefinition>();

    const update = async (
        codes: string[]
    ) => {
        codes = codes.filter(c => !ontology.has(c));

        for(let i = 0; i < codes.length; i += batchSize) {
            const response = await fetch(`${baseUrl}/private_api/goterms`, {
                method: "POST",
                body: JSON.stringify({
                    goterms: codes.slice(i, i + batchSize)
                }),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json());

            for (const definition of response) {
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
    }

    return {
        ontology,
        update
    }
}

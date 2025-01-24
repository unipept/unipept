import {ref} from "vue";
import FunctionalDefinition from "@/logic/new/ontology/functional/FunctionalDefinition";

export enum InterproNamespace {
    ActiveSite = "active site",
    BindingSite = "binding site",
    ConservedSite = "conserved site",
    Domain = "domain",
    Family = "family",
    HomologousSuperfamily = "homologous superfamily",
    PTM = "ptm",
    Repeat = "repeat",
    Unknown = "unknown"
}

export default function useInterproOntology(
    baseUrl = "https://api.unipept.ugent.be",
    batchSize = 100
) {
    const ontology = new Map<string, FunctionalDefinition>();

    const update = async (
        codes: string[]
    ) => {
        codes = Array.from(new Set(codes.filter(c => !ontology.has(c))));

        for (let i = 0; i < codes.length; i += batchSize) {
            const response = await fetch(`${baseUrl}/private_api/interpros`, {
                method: "POST",
                body: JSON.stringify({
                    interpros: codes.slice(i, i + batchSize).map(c => c.substring(4))
                }),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json());

            for (const definition of response) {
                ontology.set(
                    `IPR:${definition.code}`,
                    {
                        code: `IPR:${definition.code}`,
                        name: definition.name,
                        namespace: definition.category.toLowerCase().replace("_", " ")
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

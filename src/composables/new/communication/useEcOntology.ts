import Ontology from "@/logic/new/ontology/Ontology";
import EcDefinition from "@/logic/new/ontology/functional/ec/EcDefinition";
import FunctionalDefinition from "@/logic/new/ontology/functional/FunctionalDefinition";
import {convertEcNumberToEcNamespace} from "@/logic/new/ontology/functional/ec/EcNamespace";
import EcCode from "@/logic/new/ontology/functional/ec/EcCode";

export default function useEcOntology(
    baseUrl = "https://api.unipept.ugent.be",
    batchSize = 100
) {
    const ontology: Ontology<EcCode, FunctionalDefinition> = new Ontology(new Map());

    const process = async (
        codes: EcCode[]
    ): Promise<Ontology<EcCode, FunctionalDefinition>> => {
        codes = codes.filter(c => !ontology.has(c));

        console.log(codes);

        for(let i = 0; i < codes.length; i += batchSize) {
            const response = await fetch(`${baseUrl}/private_api/ecnumbers`, {
                method: "POST",
                body: JSON.stringify({
                    ecnumbers: codes.slice(i, i + batchSize).map(c => c.substring(3))
                }),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json());

            for (const definition of response) {
                definition.code = `EC:${definition.code}`;
                ontology.set(
                    definition.code,
                    new FunctionalDefinition(definition.code, definition.name, convertEcNumberToEcNamespace(definition.code))
                );
            }
        }

        return ontology;
    }

    return {
        process
    }
}

import {ref} from "vue";
import {convertEcNumberToEcNamespace} from "@/logic/new/ontology/functional/ec/EcNamespace";
import FunctionalDefinition from "@/logic/new/ontology/functional/FunctionalDefinition";

export enum EcNamespace {
    // EC 1.x.x.x class
    Oxidoreductases = "oxidoreductases",
    // EC 2.x.x.x class
    Transferases = "transferases",
    // EC 3.x.x.x class
    Hydrolases = "hydrolases",
    // EC 4.x.x.x class
    Lyases = "lyases",
    // EC 5.x.x.x class
    Isomerases = "isomerases",
    // EC 6.x.x.x class
    Ligases = "ligases",
    // EC 7.x.x.x class
    Translocases = "translocases"
}

export default function useEcOntology(
    baseUrl = "https://api.unipept.ugent.be",
    batchSize = 100
) {
    const ontology = ref<Map<string, FunctionalDefinition>>(new Map());

    const update = async (
        codes: string[]
    ) => {
        codes = codes.filter(c => !ontology.value.has(c));

        for(let i = 0; i < codes.length; i += batchSize) {
            const response = await fetch(`${baseUrl}/private_api/ecnumbers`, {
                method: "POST",
                body: JSON.stringify({
                    ecnumbers: codes.slice(i, i + batchSize).map(c => c.substring(3))
                }),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json());

            for (const definition of response) {
                ontology.value.set(
                    `EC:${definition.code}`,
                    {
                        code: `EC:${definition.code}`,
                        name: definition.name,
                        namespace: ecToNamespace(definition.code)
                    }
                );
            }
        }
    }

    const ecToNamespace = (code: string) => {
        return Object.values(EcNamespace)[parseInt(code.substring(0, 1)) - 1];
    }

    return {
        ontology,
        update
    }
}

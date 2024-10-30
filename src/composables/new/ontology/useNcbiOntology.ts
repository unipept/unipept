import {ref} from "vue";
import {convertEcNumberToEcNamespace} from "@/logic/new/ontology/functional/ec/EcNamespace";

export default function useNcbiOntology(
    baseUrl = "https://api.unipept.ugent.be",
    batchSize = 100
) {
    const ontology = ref<Map<number, { name: string, rank: string, lineage: number[] }>>(new Map());

    const update = async (
        ids: number[],
        with_lineages = true
    ) => {
        ids = ids.filter(id => !ontology.value.has(id));

        // Stores every taxon in the lineages of the requested taxa
        const lineage_ids = [];

        for(let i = 0; i < ids.length; i += batchSize) {
            const response = await fetch(`${baseUrl}/private_api/taxa`, {
                method: "POST",
                body: JSON.stringify({
                    taxids: ids.slice(i, i + batchSize)
                }),
                headers: { "Content-Type": "application/json" }
            }).then(r => r.json());

            for (const definition of response) {
                ontology.value.set(
                    definition.id,
                    {
                        name: definition.name,
                        rank: definition.rank,
                        lineage: definition.lineage
                    }
                );

                if (with_lineages) {
                    lineage_ids.push(...definition.lineage.filter(id => id !== null && id !== -1).map(id => Math.abs(id)));
                }
            }
        }

        if (with_lineages) {
            await update(lineage_ids, false);
        }
    }

    return {
        ontology,
        update
    }
}

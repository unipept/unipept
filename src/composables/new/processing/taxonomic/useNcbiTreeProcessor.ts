import {ref} from "vue";
import {NcbiTreeNode} from "unipept-web-components";
import CountTable from "@/logic/new/CountTable";
import useOntologyStore from "@/store/new/OntologyStore";

export default function useNcbiTreeProcessor() {
    const { getNcbiDefinition } = useOntologyStore();

    const root = ref<NcbiTreeNode>();

    const process = (
        taxaCountTable: CountTable<number>,
        taxaToPeptides: Map<number, string[]>,
        id = 1,
        name = "Organism"
    ) => {
        root.value = new NcbiTreeNode(id, name);

        for (const taxonId of taxaCountTable.keys()) {
            const taxonDefinition = getNcbiDefinition(taxonId);

            if (!taxonDefinition) {
                continue;
            }

            let currentNode = root.value;
            for (const lineageId of taxonDefinition.lineage) {
                // TODO check out what we should do with negative id's here?
                if (lineageId !== null && lineageId !== -1 && getNcbiDefinition(lineageId)) {
                    let newNode = currentNode.getChild(lineageId);
                    if (newNode === null) {
                        const definition = getNcbiDefinition(lineageId) || {
                            name: "Unknown", rank: "Unknown"
                        };
                        newNode = new NcbiTreeNode(lineageId, definition.name, definition.rank);
                        currentNode.addChild(newNode);
                    }
                    currentNode = newNode;
                }
            }

            currentNode.selfCount = taxaCountTable.getOrDefault(taxonId);
        }

        root.value.getCounts()
    }

    return {
        root,
        process
    }
}
import {markRaw, shallowRef} from "vue";
import NcbiTreeNode from "@/logic/ontology/taxonomic/NcbiTreeNode";
import CountTable from "@/logic/processors/CountTable";
import useOntologyStore from "@/store/OntologyStore";

export default function useNcbiTreeProcessor() {
    const { getNcbiDefinition } = useOntologyStore();

    const root = shallowRef<NcbiTreeNode>(new NcbiTreeNode(1, "organism", "root"));

    const nodes = shallowRef(new Map<number, NcbiTreeNode>());

    const process = (
        taxaCountTable: CountTable<number>,
        id = 1,
        name = "Organism"
    ) => {
        const newNodes = new Map<number, NcbiTreeNode>();

        const tree = new NcbiTreeNode(id, name);

        for (const taxonId of taxaCountTable.counts.keys()) {
            const taxonDefinition = getNcbiDefinition(taxonId);

            if (!taxonDefinition) {
                continue;
            }

            let currentNode = tree;
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
                        newNodes.set(lineageId, newNode);
                    }
                    currentNode = newNode;
                }
            }

            currentNode.selfCount = taxaCountTable.getOrDefault(taxonId);
        }

        tree.getCounts();
        root.value = markRaw(tree);
        newNodes.set(id, tree);
        nodes.value = markRaw(newNodes);
    }

    return {
        root,
        nodes,
        process
    }
}
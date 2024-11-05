import {HighlightedTreeProcessorData} from "@/composables/new/processing/taxonomic/useHighlightedTreeProcessor";
import {NcbiTreeNode} from "unipept-web-components";

self.onmessage = async (event) => {
    self.postMessage(await process(event.data));
};

const process = async ({
    tree,
    peptides,
    taxaToPeptides
}: HighlightedTreeProcessorData): Promise<any> => {
    return processRecursively(tree, (node: any, children: any) => {
        node.extra.included = children.some((x: any) => x.included) ||
            (
                taxaToPeptides.has(node.id) &&
                taxaToPeptides.get(node.id)!.some(pept => peptides.includes(pept))
            );

        return node;
    });
};

const processRecursively = async (
    node: any,
    f: (node: any, children: any) => any
): Promise<any> => {
    return f(
        node,
        node.children?.map(child => processRecursively(child, f)) ?? []
    );
}

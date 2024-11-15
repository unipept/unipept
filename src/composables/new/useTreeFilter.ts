import {ref} from "vue";

interface FilteredTree {
    name: string
    children: FilteredTree[]
    match?: { start: number, end: number }
}

export default function useTreeFilter(tree: FilteredTree) {
    const originalTree = ref<FilteredTree>(tree);
    const filteredTree = ref<FilteredTree>(tree);

    const update = (newTree: FilteredTree) => {
        originalTree.value = newTree;
        filteredTree.value = newTree;
    }

    const filter = (search: string) => {
        if (!search) {
            filteredTree.value = originalTree.value;
            return;
        }

        filteredTree.value = filterRecursive(JSON.parse(JSON.stringify(originalTree.value)), search)[1];
    }

    const matchItem = (item: FilteredTree, search: string) => {
        return item.name.toLowerCase().indexOf(search.toLowerCase());
    }

    const filterRecursive = (node: FilteredTree, search: string): [ boolean, FilteredTree ] => {
        if (!search) {
            return [ true, node ];
        }

        const updatedChildren: FilteredTree[] = [];
        for (const child of node.children) {
            const [ keep, updatedChild ] = filterRecursive(child, search);

            if (keep) {
                node.match = { start: 0, end: 0 };
                updatedChildren.push(updatedChild);
            }
        }

        node.children = updatedChildren;

        const match = matchItem(node, search);

        if (match !== -1) {
            node.match = { start: match, end: match + search.length };
        }

        return [ updatedChildren.length > 0 || match !== -1, node ];
    }

    return {
        filteredTree,
        filter,
        update
    }
}

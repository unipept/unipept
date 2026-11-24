export interface FilteredTree {
    id: number;
    name: string;
    nameExtra: string;
    children: FilteredTree[]
    match?: { start: number, end: number }
    extra: any
}

// Returns a copy of the tree with only the nodes whose name contains the search text (ignoring case) and their
// ancestors. A matching node gets the position of the match, an ancestor of a match gets an empty match. An empty
// search returns the given tree itself.
export function filterTree(tree: FilteredTree, search: string): FilteredTree {
    if (!search) {
        return tree;
    }

    return filterRecursive(JSON.parse(JSON.stringify(tree)), search)[1];
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

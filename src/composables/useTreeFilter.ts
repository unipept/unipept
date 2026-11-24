import {ref} from "vue";
import {filterTree, type FilteredTree} from "@/logic/utils/TreeFilter";

export default function useTreeFilter(tree: FilteredTree) {
    const originalTree = ref<FilteredTree>(tree);
    const filteredTree = ref<FilteredTree>(tree);

    const update = (newTree: FilteredTree) => {
        originalTree.value = newTree;
        filteredTree.value = newTree;
    }

    const filter = (search: string) => {
        filteredTree.value = filterTree(originalTree.value, search);
    }

    return {
        filteredTree,
        filter,
        update
    }
}

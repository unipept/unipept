import Node from "./Node";
import { TaxaCountTable } from "./counts/TaxaCountTable";

export default class Tree {
    public root: Node;
    public nodes: Map<number, Node>;
    public taxa: number[];

    // Maps a rank upon a list of all nodes associated with this rank.
    private rankNodeMap: Map<string, Set<Node>>;

    /**
     * Constructs an empty tree object with just the root. The values of the
     * node are passed as parameters.
     *
     * @param peptides A list of processed peptides that should be used to construct this tree.
     * @param id The taxon id of the root
     * @param name The name of the root
     */
    constructor(taxaCountTable: TaxaCountTable, id: number = -1, name: string = "Organism") {
        this.root = new Node(id, name);
        this.nodes = new Map();
        this.taxa = [];
        this.rankNodeMap = new Map();

        let ontology = taxaCountTable.GetOntology();

        taxaCountTable.counts.forEach((count, id) => 
        {
            let currentNode = this.getRoot();
            let taxonDef = ontology.getDefinition(id);
            for (const taxid of taxonDef.lineage) {
                if (taxid !== null) {
                    let newNode = currentNode.getChild(taxid);
                    if (newNode === null) {
                        newNode = new Node(taxid);
                        this.addChild(currentNode, newNode);
                    }
                    currentNode = newNode;
                }
            }
            
            currentNode.values = Array.from(taxaCountTable.ontology2peptide.get(id));
            currentNode.data.self_count = count;
        })

        this.root.getCounts();
    }

    /**
     * Returns the root node.
     *
     * @return {Node} The root Node
     */
    getRoot(): Node {
        return this.root;
    }

    /**
     * Adds a child Node to a given Node of the tree. Also updates the set of
     * nodes and taxa that are present in the tree.
     *
     * @param node The node to which we want to add the child
     * @param child The child we want to add
     */
    private addChild(node: Node, child: Node) {
        this.nodes.set(child.id, child);
        this.taxa.push(child.id);
        node.addChild(child);
    }

    /**
     * Returns a list of all taxon ids present in the tree.
     *
     * @return A list of taxon ids in the tree
     */
    getTaxa(): number[] {
        return this.taxa;
    }

    /**
     * Get all nodes from this tree that are situated at a specific level in the tree.
     *
     * @param depth The level in the tree from which all nodes should be returned.
     * @return All nodes that were found at this specific level.
     */
    getNodesAtDepth(depth: number): Set<Node> {
        let output: Set<Node> = new Set();

        let todo = [this.root];
        let currentDepth = 0;
        while (todo.length > 0 && currentDepth < depth) {
            currentDepth++;
            if (currentDepth === depth) {
                for (let top of todo) {
                    for (let child of top.children) {
                        output.add(child);
                    }
                }
            } else {
                let temp = [];
                for (let top of todo) {
                    temp.push(...top.children);
                }
                todo = temp;
            }
        }

        return output;
    }

    /**
     * Returns a list of nodes that are associated with the given rank. This method might return undefined when the 
     * given rank does not exist.
     * 
     * @param rank A string representing the rank for whome nodes should be queried.
     */
    getNodesWithRank(rank: string): Set<Node> {
        return this.rankNodeMap.get(rank);
    }

    /**
     * Returns all nodes in this tree of all different ranks.
     */
    getAllNodes(): Set<Node> {
        let output: Set<Node> = new Set();
        for (let nodeList of this.rankNodeMap.values()) {
            for (let node of nodeList) {
                output.add(node);
            }
        }
        return output;
    }

    /**
     * Composes a list of sequences that were added to a node with a given taxon id.
     *
     * @param nodeId the taxon id for which we want the sequences
     * @return a list of peptides (strings)
     */
    getOwnSequences(nodeId: number): string[] {
        let node;
        if (Number.isInteger(nodeId)) {
            node = this.nodes.get(nodeId);
        } else {
            node = nodeId;
        }
        return node.values;
    }

    /**
     * Composes a list of sequences that were added to a node with a given taxon id or any of its children.
     *
     * @param nodeId the taxon id for which we want the sequences
     * @return a list of peptides (strings)
     */
    getAllSequences(nodeId: number): string[] {
        let node;
        if (Number.isInteger(nodeId)) {
            node = this.nodes.get(nodeId);
        } else {
            node = nodeId;
        }
        let s = this.getOwnSequences(node);
        for (let i = 0; i < node.children.length; i++) {
            s = s.concat(this.getAllSequences(node.children[i].id));
        }
        return s;
    }

    /**
     * Completes the name and rank information present in the tree, from a list of TaxonInfos
     *
     * @param taxa The taxoninformation we want to add.
     */
    setTaxonNames(taxa: TaxonInfo[]) {
        for (let taxon of taxa) {
            const t = this.nodes.get(taxon.id);
            t.name = taxon.name;
            t.rank = taxon.rank;

            if (!this.rankNodeMap.has(t.rank)) {
                this.rankNodeMap.set(t.rank, new Set());
            }
            let nodesForRank: Set<Node> = this.rankNodeMap.get(t.rank);
            nodesForRank.add(t);
        }
    }

    /**
     * Sorts all children of the tree by name of the organism
     */
    sortTree() {
        this.root.callRecursively( function () {
            this.children.sort(function (a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        });
    }
}

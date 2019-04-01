import {FunctionalAnnotations} from "../fa/FunctionalAnnotations";
import Resultset from "./Resultset";
import {postJSON} from "../utils";
import Tree from "./Tree";
import Node from "./Node"

export default class Sample {
    public static readonly TAXA_URL: string = "/private_api/taxa";

    public tree: Tree;
    public originalPeptides: string[];
    public fa: FunctionalAnnotations;
    public baseFa: FunctionalAnnotations;
    public id: string;
    public taxonMap: Map<number, TaxonInfo>;
    public resultSet: Resultset;

    /**
     * Creates a Dataset object based on a list of peptides
     *
     * @param {string[]} [peptides=[]] A list of peptides (strings)
     * @param {string} id Unique identifier associated with this Dataset.
     */
    constructor(peptides: string[], id: string) {
        this.originalPeptides = Sample.cleanPeptides(peptides);

        this.tree = null;
        this.fa = null;
        this.baseFa = null;
        this.id = id;

        this.taxonMap = new Map();
        this.taxonMap.set(1, {id: 1, rank: "no rank", name: "root"});
    }

    /**
     * Processes the list of peptides set in the dataset and returns a
     * taxonomic tree.
     *
     * @param mpaConfig
     * @return Taxonomic tree
     */
    async search(mpaConfig: MPAConfig): Promise<Tree> {
        this.resultSet = new Resultset(this, mpaConfig);
        await this.resultSet.process();
        const tree = this.buildTree(this.resultSet.processedPeptides.values());
        const taxonInfo = Sample.getTaxonInfo(tree.getTaxa());
        tree.setCounts();
        tree.setTaxonNames(await taxonInfo);
        tree.sortTree();
        this.tree = tree;
        this.fa = null;
        this.addTaxonInfo(await taxonInfo);
        return tree;
    }

    /**
     * Reprocesses functional analysis data with other cutoff
     * @param cutoff as percent (0-100)
     * @param sequences array of peptides to take into account
     */
    async reprocessFA(cutoff: number = 50, sequences: string[] = null) {
        await this.resultSet.processFA(cutoff, sequences);
        this.fa = this.resultSet.fa;
    }

    async processFA(cutoff: number = 50, sequences: string[] = null) {

    }

    getTree(): Tree {
        return this.tree;
    }

    /**
     * Sets the current FA summary as base, accessible trough baseFa.
     */
    setBaseFA() {
        this.baseFa = this.fa.clone();
    }

    /**
     * Creates a hierarchic tree structure based on the input peptides. This is
     * also set as the tree property of the Dataset object.
     *
     * @param peptides A list of peptides to build the tree
     *   from
     * @return A taxon tree containing all peptides
     */
    buildTree(peptides: Iterable<PeptideInfo>): Tree {
        const tree = new Tree();
        for (const peptide of peptides) {
            let currentNode = tree.getRoot();
            for (const taxid of peptide.lineage) {
                if (taxid !== null) {
                    let newNode = currentNode.getChild(taxid);
                    if (newNode === null) {
                        newNode = new Node(taxid);
                        tree.addChild(currentNode, newNode);
                    }
                    currentNode = newNode;
                }
            }
            currentNode.addValue(peptide);
        }
        return tree;
    }

    /**
     * Creates a tree like structure, that is this.tree where each node has an
     * `included` property. This property indicates if this node or any of its
     * children contain the, sought for, functional annotation (code).
     *
     * @param code The FA term to look for
     * @return A taxon tree-like object annotated with `included`
     */
    async getFATree(code: string): Promise<object> {
        const pepts = (await this.getPeptidesByFA(code, null)).map(pept => pept.sequence);
        return this.tree.getRoot().callRecursivelyPostOder((t, c) => {
            const included = c.some(x => x.included) || t.values.some(pept => pepts.includes(pept.sequence));
            return Object.assign(Object.assign({}, t), {included: included, children: c});
        });
    }

    /**
     * Adds new taxon info to the global taxon map
     *
     * @param taxonInfo A list of new taxon info
     */
    addTaxonInfo(taxonInfo: TaxonInfo[]) {
        for (const t of taxonInfo) {
            this.taxonMap.set(t.id, t);
        }
    }

    /**
     * Converts the current analysis to the csv format. Each row contains a
     * peptide and its lineage, with each column being a level in the taxonomy
     *
     * @return The analysis result in csv format
     */
    toCSV(): Promise<string> {
        return this.resultSet.toCSV();
    }

    /**
     * Returns the number of matched peptides, taking the deduplication setting
     * into account.
     *
     * @return The number of matched peptides
     */
    getNumberOfMatchedPeptides(): number {
        return this.tree.root.data.count;
    }

    /**
     * Returns the number of searched for peptides, taking the deduplication
     * setting into account.
     *
     * @return The number of searched for peptides
     */
    getNumberOfSearchedForPeptides(): number {
        return this.resultSet.getNumberOfSearchedForPeptides();
    }

    /**
     * Returns the list of unmached peptides for the current resultset
     *
     * @return An array of peptides without match
     */
    getMissedPeptides(): string[] {
        return this.resultSet.missedPeptides;
    }

    /**
     * Returns a list of sequences that have the specified FA term
     * @param faName The name of the FA term (GO:000112, EC:1.5.4.1)
     * @param sequences List of sequences to limit to
     * @return A list of objects representing the matches
     */
    getPeptidesByFA(faName: string, sequences: string[]): Promise<{sequence, hits, type, annotatedCount,allCount,relativeCount,count}[]>  {
        return this.resultSet.getPeptidesByFA(faName, sequences);
    }

    /**
     * Fetches the taxon info from the Unipept API for a list of taxon id's and
     * returns an Array of objects containing the id, name and rank for each
     * result.
     *
     * @param taxids Array containing taxon id integers
     * @return containing an array of result objects
     * with id, name and rank fields
     */
    static getTaxonInfo(taxids: number[]): Promise<TaxonInfo[]> {
        return postJSON(Sample.TAXA_URL, JSON.stringify({taxids: taxids}));
    }

    /**
     * Converts a list of peptides to uppercase
     *
     * @param peptides a list of peptides
     * @return The converted list
     */
    static cleanPeptides(peptides: string[]): string[] {
        return peptides.map(p => p.toUpperCase());
    }
}

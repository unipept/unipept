import {Tree} from "./tree";
import {FunctionalAnnotations} from "../fa/FunctionalAnnotations";
import NewResultSet from "./NewResultSet";

export default class Sample {
    public readonly TAXA_URL: string = "/private_api/taxa";

    public tree: Tree;
    public originalPeptides: string[];
    public fa: FunctionalAnnotations;
    public baseFa: FunctionalAnnotations;
    public id: string;
    public taxonMap: Map<number, TaxonInfo>;
    public resultSet: NewResultSet;

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
     * @param  {MPAConfig}  mpaConfig
     * @return {Promise<Tree>} Taxonomic tree
     */
    async search(mpaConfig) {
        this.resultSet = new NewResultSet(this, mpaConfig);
        await this.resultSet.process();
        const tree = this.buildTree(this.resultSet.processedPeptides.values());
        const taxonInfo = Sample.getTaxonInfo(tree.getTaxa());
        tree.setCounts();
        tree.setTaxonNames(await taxonInfo);
        tree.sortTree();
        this.tree = tree;
        this._fa = null;
        this.addTaxonInfo(await taxonInfo);
        return tree;
    }

    /**
     * Converts a list of peptides to uppercase
     *
     * @param  {string[]} peptides a list of peptides
     * @return {string[]} The converted list
     */
    static cleanPeptides(peptides) {
        return peptides.map(p => p.toUpperCase());
    }
}

import DataSource from "../DataSource";
import DataElement from "../DataElement";
import Sample from "../Sample";
import Resultset from "../Resultset";
// @ts-ignore
import TaxaElement from "./TaxaElement";
import Tree from "../Tree";
import Node from "../Node";

export default class TaxaDataSource extends DataSource {
    private taxumLevel: string;
    private tree: Tree;

    /**
     * @param taxumLevel Determines the taxum level on which this data source operates. 
     */
    constructor(sample: Sample, mpaConfig: MPAConfig, taxumLevel: string) {
        super(sample, mpaConfig);
        this.taxumLevel = taxumLevel;
    }

    public async getTopItems(n: number): Promise<TaxaElement[]> {
        // if (!this.tree) {
        //     let resultSet: Resultset = new Resultset(this.sample, this.mpaConfig);
        //     await resultSet.process();
        //     this.tree = new Tree(resultSet.processedPeptides.values());
        //     this.tree.setTaxonNames(await Sample.getTaxonInfo(this.tree.getTaxa()));
        //     this.tree.sortTree();
        // }

        // let nodes: Node[] = this.tree.getNodesWithRank(this.taxumLevel);
        // console.log(nodes);
        return null;
    }
}

import DataSource from "./DataSource";
import DataElement from "./DataElement";
import Sample from "./Sample";
import Resultset from "./Resultset";
// @ts-ignore
import TaxaElement from "./TaxaElement";
import Tree from "./Tree";
import Node from "./Node";
import DataRepository from "./DataRepository";

export default class TaxaDataSource extends DataSource {
    private _taxumRank: string;

    /**
     * @param taxumRank Determines the taxum level on which this data source operates. 
     */
    constructor(repository: DataRepository, taxumRank: string) {
        super(repository);
        this._taxumRank = taxumRank;
    }

    public async getTopItems(n: number): Promise<TaxaElement[]> {
        let tree = this._repository.tree;
        let nodes: Node[] = tree.getNodesWithRank(this._taxumRank);
        return null;
    }
}

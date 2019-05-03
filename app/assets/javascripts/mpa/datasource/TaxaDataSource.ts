import DataSource from "./DataSource";
import DataElement from "./DataElement";
import Sample from "../Sample";
import Resultset from "../Resultset";
// @ts-ignore
import TaxaElement from "./TaxaElement";
import Tree from "../Tree";
import Node from "../Node";
import DataRepository from "./DataRepository";

export default class TaxaDataSource extends DataSource {
    /**
     * Get the n most popular items from this DataSource. The popularity is based on the amount of peptides that
     * associated with a particular DataElement.
     * 
     * @param n The amount of items that should be listed. If n is larger than the amount of available items in this
     * DataSource, all items will be returned. The returned list is sorted on the amount of peptides associated with 
     * each item.
     * @param level The TaxumRank with whome the returned TaxaElement's must be associated. 
     */
    public async getTopItems(n: number, level: string): Promise<TaxaElement[]> {
        let tree = this._repository.tree;
        let nodes: Node[] = tree.getNodesWithRank(level);
        return null;
    }

    public async getTree(): Promise<Tree> {
        return this._repository.tree;
    }
}

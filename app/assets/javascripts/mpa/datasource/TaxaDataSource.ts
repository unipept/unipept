import DataSource from "./DataSource";
// @ts-ignore
import TaxaElement from "./TaxaElement";
import Tree from "../Tree";
import Node from "../Node";
import DataRepository from "./DataRepository";
import { TaxumRank, convertStringToTaxumRank } from "./TaxumRank";
import { TaxaCountTable } from "../counts/TaxaCountTable";
import { TaxaCountProcessor } from "../processors/count/TaxaCountProcessor";

export default class TaxaDataSource extends DataSource 
{
    private _countTable: TaxaCountTable;
    private _tree: Tree;
 
    constructor(countTable: TaxaCountTable, repository: DataRepository)
    {
        super(repository);
        this._countTable = countTable;
    }

    /**
     * Get the n most popular items from this DataSource. The popularity is based on the amount of peptides that
     * associated with a particular DataElement.
     * 
     * @param n The amount of items that should be listed. If n is larger than the amount of available items in this
     * DataSource, all items will be returned. The returned list is sorted on the amount of peptides associated with 
     * each item.
     * @param level The TaxumRank with whome the returned TaxaElement's must be associated. 
     */
    public async getTopItems(n: number, level: TaxumRank = null): Promise<TaxaElement[]> {
        await this.process();
        if (level) {
            let output: TaxaElement[] = [];

            let nodes: Set<Node> = this._tree.getNodesWithRank(level);
            if (!nodes) {
                return [];
            }

            for (let node of nodes) {
                // TODO: should we use count or self_count here?
                output.push(new TaxaElement(node.name, level, node.data.count));
            }
            return output;
        } else {
            let output: TaxaElement[] = [];

            let nodes: Set<Node> = this._tree.getAllNodes();
            if (!nodes) {
                return [];
            }

            for (let node of nodes) {
                // TODO: should we use count or self_count here?
                output.push(new TaxaElement(node.name, convertStringToTaxumRank(node.rank), node.data.count));
            }
            return output;
        }
    }

    /**
     * @return A tree based on all peptides associated with this DataSource. No filtering has been performed whatsoever.
     */
    public async getTree(): Promise<Tree> {
        await this.process();
        return this._tree;
    }
    
    public async getTreeByPeptides(peptides: string[]) : Promise<Node> {
        await this.process();
        return this._tree.getRoot().callRecursivelyPostOder((t: Node, c: any) => {
            const included = c.some(x => x.included) || t.values.some(pept => peptides.includes(pept));
            return Object.assign(Object.assign({}, t), {included: included, children: c});
        });
    }

    public async getAffectedPeptides(element: TaxaElement): Promise<string[]> {
        await this.process();
        // TODO enumerating all nodes here should not be necessary!
        let nodesForRank: Set<Node> = this._tree.getNodesWithRank(element.rank);
        for (let node of nodesForRank) {
            if (node.name === element.name) {                
                return this._tree.getAllSequences(node.id);
            }
        }
        return [];
    }

    private async process(): Promise<void> {
        if (!this._tree) 
        {
            this._tree = await TaxaCountProcessor.process(this._countTable);
        }
    }
}

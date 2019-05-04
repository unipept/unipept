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
    private _tree: Tree;
    // These are the peptides that couldn't be matched with the database.
    private _missedPeptides: string[];
    // The amount of peptides that were found in the database.
    private _matchedPeptides: number;
    // The amount of peptides that have been looked up in the database. This is the total amount of peptides that were
    // searched.
    private _searchedPeptides: number;

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
        //let tree = this._repository.tree;
        //let nodes: Node[] = tree.getNodesWithRank(level);
        // TODO complete implementation here!
        return null;
    }

    public async getTree(): Promise<Tree> {
        await this.process();
        return this._tree;
    }

    public async getMissedPeptides(): Promise<string[]> {
        await this.process();
        return this._missedPeptides;
    }

    public async getAmountOfMatchedPeptides(): Promise<number> {
        await this.process();
        return this._matchedPeptides;
    }

    public async getAmountOfSearchedPeptides(): Promise<number> {
        await this.process();
        return this._searchedPeptides;
    }

    private async process(): Promise<void> {
        if (!this._tree || !this._missedPeptides || this._matchedPeptides === undefined || this._searchedPeptides === undefined) {
            let results: [Tree, string[], number, number] = await this._repository.computeTaxa();
            this._tree = results[0];
            this._missedPeptides = results[1];
            this._matchedPeptides = results[2];
            this._searchedPeptides = results[3];
        }
    }
}

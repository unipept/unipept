import DataSource from "./DataSource";
import DataElement from "./DataElement";
import Sample from "../Sample";
import Resultset from "../Resultset";
// @ts-ignore
import TaxaElement from "./TaxaElement";
import Tree from "../Tree";
import Node from "../Node";
import DataRepository from "./DataRepository";
import GoTerm from "../../fa/GoTerm";
import PeptideInfo from "../PeptideInfo";

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

    /**
     * @return A tree based on all peptides associated with this DataSource. No filtering has been performed whatsoever.
     */
    public async getTree(): Promise<Tree> {
        await this.process();
        return this._tree;
    }

    /**
     * Returns a tree based on the taxonomic lineage of a specific GO-term. Only the peptides that are associated with
     * the given GO-term are taken into account here.
     * 
     * @param term The GO-Term that should be used for filtering the peptides that are part of the tree.
     * @return A new Tree that represents the taxonomic lineage of the given GO-term.
     */
    public async getTreeByGoTerm(term: GoTerm): Promise<Node> {
        await this.process();
        let pepts = await (await this._repository.getWorker()).getPeptidesByFA(term.code, null);
        let sequences = pepts.map(pept => pept.sequence);
        
        return this._tree.getRoot().callRecursivelyPostOder((t: Node, c: any) => {
            const included = c.some(x => x.included) || t.values.some(pept => sequences.includes(pept.sequence));
            return Object.assign(Object.assign({}, t), {included: included, children: c});
        });
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
            let worker = await this._repository.getWorker();
            let {processed, missed, numMatched, numSearched}: {processed: PeptideInfo[], missed: string[], numMatched: number, numSearched: number} 
                = await worker.getResult();

            let processedPeptides: Map<string, PeptideInfo> = new Map();
            for (const p of processed) {
                processedPeptides.set(p.sequence, p);
            }

            this._tree = new Tree(processed);
            const taxonInfo = await Sample.getTaxonInfo(this._tree.getTaxa());
            this._tree.setTaxonNames(taxonInfo);
            this._tree.sortTree();

            this._missedPeptides = missed;
            this._matchedPeptides = numMatched;
            this._searchedPeptides = numSearched;
        }
    }
}

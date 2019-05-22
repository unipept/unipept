import DataSource from "./DataSource";
import Sample from "../Sample";
import Resultset from "../Resultset";
// @ts-ignore
import TaxaElement from "./TaxaElement";
import Tree from "../Tree";
import Node from "../Node";
import DataRepository from "./DataRepository";
import GoTerm from "../../fa/GoTerm";
import PeptideInfo from "../PeptideInfo";
import EcNumber from "../../fa/EcNumber";
import { TaxumRank, convertStringToTaxumRank } from "./TaxumRank";

export default class TaxaDataSource extends DataSource {
    private _tree: Tree;
    // These are the peptides that couldn't be matched with the database.
    private _missedPeptides: string[];
    // The amount of peptides that were found in the database.
    private _matchedPeptides: number;
    // The amount of peptides that have been looked up in the database. This is the total amount of peptides that were
    // searched.
    private _searchedPeptides: number;
    private _computationStarted: boolean = false

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
            console.log(this._tree);
            if (!nodes) {
                return [];
            }

            for (let node of nodes) {
                // TODO: should we use count or self_count here?
                output.push(new TaxaElement(node.name, level, node.data.count));
            }
            console.log(output);
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
            console.log(output);
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

    /**
     * Returns a tree based on the taxonomic lineage of a specific GO-term. Only the peptides that are associated with
     * the given GO-term are taken into account here.
     * 
     * @param term The GO-Term that should be used for filtering the peptides that are part of the tree.
     * @return A new Node (root of the tree) that represents the taxonomic lineage of the given GO-term.
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

    /**
     * Returns a tree based on the taxonomic lineage of a specific EC-number. Only the peptides that are associated with
     * the given EC-number are taken into account here.
     * 
     * @param number The EC-Number that should be used for filtering the peptides that are part of the tree.
     * @return A new Node (root of the tree) that represents the taxonomic lineage of the given EC-Number.
     */
    public async getTreeByEcNumber(number: EcNumber): Promise<Node> {
        await this.process();
        let pepts = await (await this._repository.getWorker()).getPeptidesByFA(number.code, null);
        let sequences = pepts.map(pept => pept.sequence);
        
        return this._tree.getRoot().callRecursivelyPostOder((t: Node, c: any) => {
            const included = c.some(x => x.included) || t.values.some(pept => sequences.includes(pept.sequence));
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
            this._tree.sortTree();

            this._missedPeptides = missed;
            this._matchedPeptides = numMatched;
            this._searchedPeptides = numSearched;
        }
    }
}

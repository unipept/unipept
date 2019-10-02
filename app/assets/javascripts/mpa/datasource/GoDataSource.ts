import DataRepository from "./DataRepository";
import { GoNameSpace } from "../../fa/GoNameSpace";
import DataSource from "./DataSource";
import GoTerm from "../../fa/GoTerm";
import FATrust from "../../fa/FATrust";
import sha256 from "crypto-js/sha256";
import { MPAFAResult } from "../newworker";
import { CachedDataSource } from "./CachedDataSource";
import { GOCountTable } from "../counts/GOCountTable";
import { GeneOntology } from "../ontology/go/GeneOntology";
import { ProcessedPeptideContainer } from "../ProcessedPeptideContainer";
import { stringLiteral } from "@babel/types";

/**
 * A GoDataSource can be used to access all GoTerms associated with a specific Sample. Note that this class contains
 * an extensive cache that reduces the amount of information that must be transfered between the server and the client's
 * browser.
 * 
 * @see Sample
 */
export default class GoDataSource extends CachedDataSource<GoNameSpace, GoTerm>  
{
    private _countTable: GOCountTable;
    private _processedPeptideContainer: ProcessedPeptideContainer;

    constructor(countTable: GOCountTable, processedPeptideContainer: ProcessedPeptideContainer, repository: DataRepository)
    {
        super(repository)
        this._countTable = countTable;
        this._processedPeptideContainer = processedPeptideContainer;
    }

    /**
     * Get the n most popular GO-Terms for a specific namespace. The returned GO-Terms are sorted by popularity.
     * 
     * @param n The amount of most popular GO-Terms that should be returned. If n is larger than the amount of terms 
     * exist, all terms of the given namespace will be returned.
     * @param namespace The GO-namespace for which the most popular terms must be returned. Leave blanc if the most
     * popular terms over all namespaces must be returned.
     */
    public async getTopItems(n: number, namespace: GoNameSpace = null): Promise<GoTerm[]> {
        if (namespace) {
            let result: [GoTerm[], FATrust] = await this.getFromCache(namespace, Object.values(GoNameSpace));
            // The GO-Terms in the cache are sorted per namespace from high to low popularity. We can just return the first
            // n items of the found 
            let list: GoTerm[] = result[0];
            return list.slice(0, Math.min(n, list.length));
        } else {
            let output: GoTerm[] = [];
            for (let ns of Object.values(GoNameSpace)) {
                let result: [GoTerm[], FATrust] = await this.getFromCache(ns, Object.values(GoNameSpace));
                if (result && result[0] && result[0].length > 0) {
                    output.push(...result[0].slice(0, Math.min(n, result[0].length)));
                }
            }

            return output.sort((a: GoTerm, b: GoTerm) => b.popularity - a.popularity).slice(0, Math.min(n, output.length));
        }
    }

    /**
     * Get all GO-terms for a specific cutoff, and taking into account only those sequences found in the given
     * sequences array.
     * 
     * @param namespace the specific GO namespace for which GO-terms should be returned.
     * @param cutoff as percent (0-100)
     * @param sequences array of peptides to take into account
     */
    public async getGoTerms(namespace: GoNameSpace, sequences: string[] = null): Promise<GoTerm[]> {
        let result: [GoTerm[], FATrust] = await this.getFromCache(namespace, Object.values(GoNameSpace), sequences);
        return result[0];
    }

    /**
     * Get the Trust level of some specific configuration for retrieving GO-terms.
     * 
     * @param namespace 
     * @param cutoff 
     * @param sequences 
     */
    public async getTrust(namespace: GoNameSpace = null, sequences: string[] = null): Promise<FATrust> {
        if (namespace) {
            let result: [GoTerm[], FATrust] = await this.getFromCache(namespace, Object.values(GoNameSpace), sequences);
            return result[1];
        } else {
            let trusts: FATrust[] = [];
            for (let ns of Object.values(GoNameSpace)) {
                let result: [GoTerm[], FATrust] = await this.getFromCache(ns, Object.values(GoNameSpace), sequences);
                trusts.push(result[1]);
            }
            return this.agregateTrust(trusts);
        }
        
    }

    protected async computeTerms(sequences: string[] = null): Promise<[Map<GoNameSpace, GoTerm[]>, Map<GoNameSpace, FATrust>]> 
    {
        // first fetch Ontology data if needed
        var ontology: GeneOntology = this._countTable.GetOntology()
        await ontology.fetchDefinitions(this._countTable.GetOntologyIds())

        var dataOutput: Map<GoNameSpace, GoTerm[]> = new Map()
        var trustOutput: Map<GoNameSpace, FATrust> = new Map()

        // calculate terms without peptide information if it is not available
        if(!this._processedPeptideContainer)
        {
            let namespaceCounts = new Map<string, number>()

            // first calculated the total counts for each namespace
            this._countTable.counts.forEach((count, term) => 
            {
                let namespace = ontology.getDefinition(term).namespace
                namespaceCounts.set(namespace, (namespaceCounts.get(namespace) || 0) + count)
            })

            // create FATrusts for each namespace, at the same time init dataOutput arrays
            for(let namespace of Object.values(GoNameSpace))
            {
                let namespaceCount = namespaceCounts.get(namespace) || 0
                trustOutput.set(namespace, new FATrust(namespaceCount, namespaceCount));
                dataOutput.set(namespace, [])
            }

            // create GoTerms
            this._countTable.counts.forEach((count, term) => 
            {
                let def = ontology.getDefinition(term)
                let namespaceCount = namespaceCounts.get(def.namespace)
                let goNameSpace: GoNameSpace = def.namespace as GoNameSpace

                let goTerm = new GoTerm(def.code, def.name, goNameSpace, count, count / namespaceCount, [])
                dataOutput.get(goNameSpace).push(goTerm);
            })

            return [dataOutput, trustOutput];
        }

        var peptideCountTable = this._processedPeptideContainer.countTable

        if(sequences == null)
        {
            sequences = Array.from(this._processedPeptideContainer.countTable.keys())
        }

        for(let namespace of Object.values(GoNameSpace))
        {
            let totalCount = 0;
            let annotatedCount = 0;
            let termCounts = new Map<string, number>()
            // TODO: this shouldn't be calculated here, but only when needed for the heatmap
            let affectedPeptides = new Map<string, string[]>()

            for(const pept of sequences)
            {
                if(!this._countTable.peptide2ontology.has(pept))
                {
                    continue;
                }

                let peptCount = peptideCountTable.get(pept)
                let terms = this._countTable.peptide2ontology.get(pept)
                .filter(term => ontology.getDefinition(term).namespace === namespace)

                totalCount += peptCount

                let peptArray: string[] = Array(peptCount).fill(pept)

                for(const term of terms)
                {
                    termCounts.set(term, (termCounts.get(term) || 0) + peptCount)
                    affectedPeptides.set(term, (affectedPeptides.get(term) || []).concat(peptArray))
                }

                if(terms.length > 0)
                {
                    annotatedCount += peptCount
                }
            }
            
            // convert calculated data to GoTerms
            let convertedItems: GoTerm[] = [...termCounts].sort((a, b) => b[1] - a[1])
                .map(term => 
                    {
                        let code = term[0]
                        let count = term[1]
                        let ontologyData = ontology.getDefinition(code)
                        let fractionOfPepts = count / totalCount
                        return new GoTerm(code, ontologyData.name, namespace, count, fractionOfPepts, affectedPeptides.get(code))
                    })

            dataOutput.set(namespace, convertedItems);
            // convert calculated data to FATrust
            trustOutput.set(namespace, new FATrust(annotatedCount, totalCount));
        }

        return [dataOutput, trustOutput];
    }
}

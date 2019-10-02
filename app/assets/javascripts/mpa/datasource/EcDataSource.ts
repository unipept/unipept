import EcNumber from "../../fa/EcNumber";
import { EcNameSpace } from "../../fa/EcNameSpace";
import FATrust from "../../fa/FATrust";
import { CachedDataSource } from "./CachedDataSource";
import TreeViewNode from "../ui/visualizations/TreeViewNode";
import { ECOntology } from "../ontology/ec/ECOntology";
import { ECCountTable } from "../counts/ECCountTable";
import { ProcessedPeptideContainer } from "../ProcessedPeptideContainer";
import DataRepository from "./DataRepository";

export default class EcDataSource extends CachedDataSource<EcNameSpace, EcNumber> 
{
    private _countTable: ECCountTable;
    private _processedPeptideContainer: ProcessedPeptideContainer;

    constructor(countTable: ECCountTable, processedPeptideContainer: ProcessedPeptideContainer, repository: DataRepository)
    {
        super(repository)
        this._countTable = countTable;
        this._processedPeptideContainer = processedPeptideContainer;
    }

    public getPeptidesByEcNumber(number: EcNumber): string[]
    {
        return Array.from(this._countTable.ontology2peptide.get(number.code) || [])
    }

    public getPeptidesByEcCode(code: string)
    {
        return Array.from(this._countTable.ontology2peptide.get(code) || [])
    }

    /**
     * Retrieve the top n EC-Numbers for a specific namespace. If the namespace is not specified (null), the resulting
     * EC-Numbers will not be restricted to a specific namespace.
     * 
     * @param n The amount of EC-numbers that should be returned. If n is bigger than the amount of EC-Numbers available
     * all available numbers will be returned and the result will contain less than n numbers.
     * @param namespace The EC namespace to which the returned results should belong. Leave blanco if no filtering
     * should be performed.
     * @return A list of EC-Numbers, sorted by popularity.
     */
    public async getTopItems(n: number, namespace: EcNameSpace = null): Promise<EcNumber[]> {
        if (namespace) {
            let result: [EcNumber[], FATrust] = await this.getFromCache(namespace, Object.values(EcNameSpace));
            return result[0].slice(0, Math.min(n, result[0].length));
        } else {
            let output: EcNumber[] = [];
            for (let ns of Object.values(EcNameSpace)) {
                let result: [EcNumber[], FATrust] = await this.getFromCache(ns, Object.values(EcNameSpace));
                if (result && result[0] && result[0].length > 0) {
                    output.push(...result[0].slice(0, Math.min(n, result[0].length)));
                }
            }

            return output.sort((a: EcNumber, b: EcNumber) => b.popularity - a.popularity).slice(0, Math.min(n, output.length));
        }
    }

    /**
     * Returns a list of EC-Numbers that satisfy the given filtering requirements.
     * 
     * @param namespace The EC-Namespace to which all returned EC-Numbers should belong. If this is null, EC-Numbers
     * from all namespaces will be returned.
     * @param cutoff 
     * @param sequences 
     */
    public async getEcNumbers(namespace: EcNameSpace = null, sequences: string[] = null): Promise<EcNumber[]> {
        if (namespace) {
            let result: [EcNumber[], FATrust] = await this.getFromCache(namespace, Object.values(EcNameSpace), sequences);
            return result[0];
        } else {
            let output: EcNumber[] = [];
            for (let ns of Object.values(EcNameSpace)) {
                let result: [EcNumber[], FATrust] = await this.getFromCache(ns, Object.values(EcNameSpace), sequences);
                output.push(... result[0]);
            }
            output.sort((a: EcNumber, b: EcNumber) => b.popularity - a.popularity);
            return output;
        }
    }

    public async getTrust(namespace: EcNameSpace = null, sequences: string[] = null): Promise<FATrust> {
        if (namespace) {
            let result: [EcNumber[], FATrust] = await this.getFromCache(namespace, Object.values(EcNameSpace), sequences);
            return result[1];
        } else {
            let trusts: FATrust[] = [];
            for (let ns of Object.values(EcNameSpace)) {
                let result: [EcNumber[], FATrust] = await this.getFromCache(ns, Object.values(EcNameSpace), sequences);
                trusts.push(result[1]);
            }
            return this.agregateTrust(trusts);
        }
    }

    /**
     * Query the EC-datasource and directly convert the found results into an EC-tree.
     * 
     * @param namespace 
     * @param cutoff 
     * @param sequences 
     * @return A data model that can be used for a treeview.
     */
    public async getEcTree(namespace: EcNameSpace = null, sequences: string[] = null): Promise<TreeViewNode> {
        let result: EcNumber[] = await this.getEcNumbers(namespace, sequences);
        // Maps an EC-code onto a Node.
        let codeNodeMap: Map<string, TreeViewNode> = new Map();

        // Initialize the root node
        codeNodeMap.set("-.-.-.-", {
            id: 0, 
            name: "-.-.-.-",
            children: [],
            data: {
                self_count: 0,
                count: 0,
                data: {
                    sequences: Object.create(null),
                    self_sequences: Object.create(null),
                },
            },
        });

        const getOrNew = key => {
            if (!codeNodeMap.has(key)) {
                codeNodeMap.set(key, {
                    id: key.split(".").map(x => ("0000" + x).slice(-4)).join("."),
                    name: key.split(".").filter(x => x !== "-").join("."),
                    children: [],
                    data: {self_count: 0, count: 0, data: {
                        code: key, value: 0,
                        sequences: Object.create(null),
                        self_sequences: Object.create(null),
                    }},
                });
                const ancestors = EcNumber.computeAncestors(key, true);
                getOrNew(ancestors[0]).children.push(codeNodeMap.get(key));
            }
            return codeNodeMap.get(key);
        };

        // Sort from generic to specific
        const sortedEC = result.sort((a: EcNumber, b: EcNumber) => a.level - b.level);

        for (const data of sortedEC) {
            const toInsert = {
                id: data.code.split(".").map(x => ("0000" + x).slice(-4)).join("."),
                name: data.code.split(".").filter(x => x !== "-").join("."),
                children: [],
                data: {
                    self_count: data.popularity,
                    count: data.popularity,
                    data: data
                }
            }

            codeNodeMap.set(data.code, toInsert);

            const ancestors = EcNumber.computeAncestors(data.code, true);
            getOrNew(ancestors[0]).children.push(toInsert);
            for (const a of ancestors) {
                getOrNew(a).data.count += toInsert.data.count;
            }
        }

        // Order the nodes by their id (order by EC number)
        for (let val of codeNodeMap.values()) {
            val.children.sort((a, b) => a.id.localeCompare(b.id));
        }

        return codeNodeMap.get("-.-.-.-");
    }

    protected async computeTerms(sequences = null): Promise<[Map<EcNameSpace, EcNumber[]>, Map<EcNameSpace, FATrust>]> 
    {
        // first fetch Ontology data if needed
        var ontology: ECOntology = this._countTable.GetOntology()
        await ontology.fetchDefinitions(this._countTable.GetOntologyIds())

        var dataOutput: Map<EcNameSpace, EcNumber[]> = new Map()
        var trustOutput: Map<EcNameSpace, FATrust> = new Map()

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
            for(let namespace of Object.values(EcNameSpace))
            {
                let namespaceCount = namespaceCounts.get(namespace) || 0
                trustOutput.set(namespace, new FATrust(namespaceCount, namespaceCount));
                dataOutput.set(namespace, [])
            }

            // create EcNumbers
            this._countTable.counts.forEach((count, term) => 
            {
                let def = ontology.getDefinition(term)
                let namespaceCount = namespaceCounts.get(def.namespace)
                let ecNameSpace: EcNameSpace = def.namespace as EcNameSpace

                let ecNumber = new EcNumber(def.code, def.name, ecNameSpace, count, count / namespaceCount, [])
                dataOutput.get(ecNameSpace).push(ecNumber);
            })

            // sort the EcNumbers for each namespace
            for(let namespace of Object.values(EcNameSpace))
            {
                dataOutput.set(namespace, dataOutput.get(namespace).sort((a, b) => b.popularity - a.popularity))
            }

            return [dataOutput, trustOutput];
        }

        var peptideCountTable = this._processedPeptideContainer.countTable

        if(sequences == null)
        {
            sequences = Array.from(this._processedPeptideContainer.countTable.keys())
        }

        for(let namespace of Object.values(EcNameSpace))
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
            let convertedItems: EcNumber[] = [...termCounts].sort((a, b) => b[1] - a[1])
                .map(term => 
                    {
                        let code = term[0]
                        let count = term[1]
                        let ontologyData = ontology.getDefinition(code)
                        let fractionOfPepts = count / totalCount
                        return new EcNumber(code, ontologyData.name, namespace, count, fractionOfPepts, affectedPeptides.get(code))
                    })

            dataOutput.set(namespace, convertedItems);
            // convert calculated data to FATrust
            trustOutput.set(namespace, new FATrust(annotatedCount, totalCount));
        }

        return [dataOutput, trustOutput];
    }
}

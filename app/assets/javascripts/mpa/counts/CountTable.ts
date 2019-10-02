type Peptide = string;

export type Count = number;

export abstract class CountTable<Ontology, OntologyId>
{
    readonly totalCount;

    constructor(
        readonly counts: Map<OntologyId, Count>,
        readonly ontology2peptide: Map<OntologyId, Set<Peptide>> = undefined, 
        readonly peptide2ontology: Map<Peptide, OntologyId[]> = undefined)
    {
        let ontologyCounts = [...counts.values()]
        this.totalCount = ontologyCounts.length? [...counts.values()].reduce((a, b) => a + b) : 0
    }

    GetOntologyIds() : OntologyId[]
    {
        return Array.from(this.counts.keys());
    }

    abstract GetOntology() : Ontology;
}
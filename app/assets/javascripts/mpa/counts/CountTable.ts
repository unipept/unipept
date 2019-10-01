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
        this.totalCount = [...counts.values()].reduce((a, b) => a + b)
    }

    GetOntologyIds() : OntologyId[]
    {
        return Array.from(this.counts.keys());
    }

    abstract GetOntology() : Ontology;
}
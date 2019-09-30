type Peptide = string;

export type Count = number;

export abstract class CountTable<Ontology, OntologyId>
{
    constructor(
        readonly counts: Map<OntologyId, Count>,
        readonly ontology2peptide: Map<OntologyId, Set<Peptide>> = undefined, 
        readonly peptide2ontology: Map<Peptide, Set<OntologyId>> = undefined)
    {}

    abstract GetOntology() : Ontology;
}
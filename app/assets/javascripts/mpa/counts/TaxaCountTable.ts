import {CountTable, Count} from './CountTable';
import {NCBITaxonomy} from '../ontology/taxa/NCBITaxonomy';
import {Ontologies} from '../ontology/Ontologies';

export class TaxaCountTable extends CountTable<NCBITaxonomy, number>
{
    constructor(
        counts: Map<number, Count>, 
        ontology2peptide: Map<number, Set<string>> = undefined)
    {
        super(counts, ontology2peptide)
    }

    GetOntology(): NCBITaxonomy {
        return Ontologies.ncbiTaxonomy;
    }
}

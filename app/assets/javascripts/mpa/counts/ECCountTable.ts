import {CountTable, Count} from './CountTable';
import {ECOntology} from '../ontology/ec/ECOntology';
import {Ontologies} from '../ontology/Ontologies';

export class ECCountTable extends CountTable<ECOntology, string>
{
    constructor(
        counts: Map<string, Count>, 
        peptide2ontology: Map<string, string[]> = undefined)
    {
        super(counts, undefined, peptide2ontology)
    }

    GetOntology(): ECOntology {
        return Ontologies.ecOntology;
    }
}
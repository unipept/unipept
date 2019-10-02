import {CountTable, Count} from './CountTable';
import {GeneOntology} from '../ontology/go/GeneOntology';
import {Ontologies} from '../ontology/Ontologies';

export class GOCountTable extends CountTable<GeneOntology, string>
{
    GetOntology(): GeneOntology {
        return Ontologies.geneOntology;
    }
}
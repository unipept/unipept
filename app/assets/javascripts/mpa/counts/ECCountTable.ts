import {CountTable, Count} from './CountTable';
import {ECOntology} from '../ontology/ec/ECOntology';
import {Ontologies} from '../ontology/Ontologies';

export class ECCountTable extends CountTable<ECOntology, string>
{
    GetOntology(): ECOntology {
        return Ontologies.ecOntology;
    }
}
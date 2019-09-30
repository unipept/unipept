import {Ontology} from '../Ontology'
import {GOTerm} from './GOTerm';

type OntologyId = string;

export class GeneOntology extends Ontology<OntologyId, GOTerm>
{
    fetchDefinitions(ids: OntologyId[]){
        throw new Error("Method not implemented.");
    }
}

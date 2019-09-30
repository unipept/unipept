import {Ontology} from '../Ontology'
import {ECNumber} from './ECNumber';

type OntologyId = string;

export class ECOntology extends Ontology<OntologyId, ECNumber>
{
    fetchDefinitions(ids: OntologyId[]){
        throw new Error("Method not implemented.");
    }
}

import {Ontology} from '../Ontology'
import {GOTerm} from './GOTerm';

type OntologyId = string;

export class GeneOntology extends Ontology<OntologyId, GOTerm>
{
    fetchDefinitions(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

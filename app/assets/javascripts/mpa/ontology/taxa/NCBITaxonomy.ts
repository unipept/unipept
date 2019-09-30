import {Ontology} from '../Ontology'
import {NCBITaxon} from './NCBITaxon';

type OntologyId = number;

export class NCBITaxonomy extends Ontology<OntologyId, NCBITaxon>
{
    fetchDefinitions(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

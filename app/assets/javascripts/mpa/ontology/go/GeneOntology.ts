import {Ontology} from '../Ontology'
import {GOTerm} from './GOTerm';
import {postJSON} from "../../../utils";

type OntologyId = string;

const GO_BATCH_SIZE = 100
const GO_URL = "private_api/goterms"

export class GeneOntology extends Ontology<OntologyId, GOTerm>
{
    async fetchDefinitions(ids: OntologyId[])
    {
        ids = ids.filter(id => !this._definitions.has(id))

        // get GO info
        for (let i = 0; i < ids.length; i += GO_BATCH_SIZE) 
        {
            const data = JSON.stringify({
                goterms: ids.slice(i, i + GO_BATCH_SIZE)
            });

            const res = await postJSON(GO_URL, data);
            
            res.forEach(term => {
                if(!this._definitions.has(term.code))
                {
                    this._definitions.set(term.code, term)
                }
            })
        }
    }
}

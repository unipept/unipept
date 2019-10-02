import {Ontology} from '../Ontology'
import {ECNumber} from './ECNumber';
import {postJSON} from "../../../utils";

type OntologyId = string;

const EC_BATCH_SIZE = 100
const EC_URL = "private_api/ecnumbers"

export class ECOntology extends Ontology<OntologyId, ECNumber>
{
    async fetchDefinitions(ids: OntologyId[])
    {
        // TODO: check if this is still needed
        // calculate ids to fetch
        const todo = new Set();
        for (const id of ids.map(id => id.substr(3)))
        {
            if (!this._definitions.has("EC:" + id))
            {
                todo.add(id);
                const parts = id.split(".");
                const numSpecific = parts.includes("-") ? parts.indexOf("-") : parts.length;
                for (let i = numSpecific - 1; i >= 1; i--)
                {
                    parts[i] = "-";
                    const newKey = parts.join(".");
                    if (!this._definitions.has("EC:" + newKey))
                    {
                        todo.add(newKey);
                    }
                    else
                    {
                        break; // the key already exists (all following already done)
                    }
                }
            }
        }

        let todoList = Array.from(todo);

        // get EC info
        for (let i = 0; i < todoList.length; i += EC_BATCH_SIZE) 
        {
            const data = JSON.stringify({
                ecnumbers: todoList.slice(i, i + EC_BATCH_SIZE)
            });

            const res = await postJSON(EC_URL, data);
            
            res.forEach(number => {
                let prefixedNumber = "EC:" + number.code
                if(!this._definitions.has(prefixedNumber))
                {
                    this._definitions.set(prefixedNumber, number)
                }
            })
        }
    }
}

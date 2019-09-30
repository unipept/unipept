export abstract class Ontology<OntologyId, Definition>
{
    constructor(
        protected _definitions = new Map<OntologyId, Definition>()
    ){}
    
    getDefinition(id: OntologyId) : Readonly<Definition>
    {
        return this._definitions.get(id);
    }
}

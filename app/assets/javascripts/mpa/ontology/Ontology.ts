export abstract class Ontology<OntologyId, Definition>
{
    constructor(
        private _definitions = new Map<OntologyId, Definition>()
    ){}

    abstract async fetchDefinitions() : Promise<void>;

    getDefinition(id: OntologyId) : Readonly<Definition>
    {
        return this._definitions.get(id);
    }
}

import {NCBITaxonomy} from './taxa/NCBITaxonomy'
import {GeneOntology} from './go/GeneOntology'
import {ECOntology} from './ec/ECOntology'

export namespace Ontologies
{
    export const ecOntology = new ECOntology()
    export const geneOntology = new GeneOntology()
    export const ncbiTaxonomy = new NCBITaxonomy()

    // should be called only once at application startup
    export async function fetchDefinitions() : Promise<void>
    {
        await Promise.all([
            this._ecOntology.fetchDefinitions(),
            this._geneOntology.fetchDefinitions(),
            this._ncbiTaxonomy.fetchDefinitions()
        ])
    }
}
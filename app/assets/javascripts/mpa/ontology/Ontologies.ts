import {NCBITaxonomy} from './taxa/NCBITaxonomy'
import {GeneOntology} from './go/GeneOntology'
import {ECOntology} from './ec/ECOntology'

export namespace Ontologies
{
    export const ecOntology = new ECOntology()
    export const geneOntology = new GeneOntology()
    export const ncbiTaxonomy = new NCBITaxonomy()
}
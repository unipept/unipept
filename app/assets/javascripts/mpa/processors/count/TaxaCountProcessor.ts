import { TaxaCountTable } from "../../counts/TaxaCountTable";
import Tree from "../../Tree";

export namespace TaxaCountProcessor
{
    export async function process(taxaCountTable: TaxaCountTable) : Promise<Tree>
    {
        var ontologyIds = taxaCountTable.GetOntologyIds();
        var ontology = taxaCountTable.GetOntology();

        await ontology.getLineages(ontologyIds);
        let tree = new Tree(taxaCountTable);

        await ontology.getTaxaInfo(tree.taxa);
        tree.setTaxonNames(tree.taxa.map(id => ontology.getDefinition(id)));
        tree.sortTree();
        
        return tree;
    }
}
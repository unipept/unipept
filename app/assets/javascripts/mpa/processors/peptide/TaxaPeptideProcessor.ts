import {PeptideProcessor} from "./PeptideProcessor";
import {ProcessedPeptideContainer} from '../../ProcessedPeptideContainer';
import {TaxaCountTable} from '../../counts/TaxaCountTable';
import {Count} from '../../counts/CountTable';

export class TaxaPeptideProcessor implements PeptideProcessor<TaxaCountTable>
{
    process(processedPeptides: ProcessedPeptideContainer): TaxaCountTable 
    {
        var peptideCounts = processedPeptides.countTable;
        var pept2dataResponse = processedPeptides.response;

        var lcaCounts = new Map<number, Count>();
        var lca2peptides = new Map<number, Set<string>>();

        pept2dataResponse.GetResponse().forEach((data, peptide, _) => 
            {
                let lca = data.lca
                let peptideCount = peptideCounts.get(peptide)

                lcaCounts.set(lca, (lcaCounts.get(lca) || 0) + peptideCount)

                if(!lca2peptides.has(lca))
                    lca2peptides.set(lca, new Set())
                lca2peptides.get(lca).add(peptide)
            })
        
        return new TaxaCountTable(lcaCounts, lca2peptides)
    }
}

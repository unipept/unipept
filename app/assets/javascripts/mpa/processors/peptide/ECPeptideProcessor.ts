import {ProcessedPeptideContainer} from '../../ProcessedPeptideContainer';
import {Count} from '../../counts/CountTable';
import { ECCountTable } from '../../counts/ECCountTable';

export namespace ECPeptideProcessor
{
    export function process(processedPeptides: ProcessedPeptideContainer): ECCountTable 
    {
        var peptideCounts = processedPeptides.countTable;
        var pept2dataResponse = processedPeptides.response;

        var ecCounts = new Map<string, Count>();
        var peptide2ec = new Map<string, Set<string>>();

        pept2dataResponse.GetResponse().forEach((data, peptide, _) => 
        {
            let fas = data.fa.data || [];
            let peptideCount = peptideCounts.get(peptide)

            Object.keys(fas)
                .filter(term => term.startsWith("EC:"))
                .forEach(term => 
                    {
                        ecCounts.set(term, (ecCounts.get(term) || 0) + peptideCount)
                        
                        if(!peptide2ec.has(peptide))
                            peptide2ec.set(peptide, new Set())
                        peptide2ec.get(peptide).add(term)
                    });
        })

        return new ECCountTable(ecCounts, peptide2ec);
    }
}
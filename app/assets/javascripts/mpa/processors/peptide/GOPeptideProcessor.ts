import {ProcessedPeptideContainer} from '../../ProcessedPeptideContainer';
import { Count } from '../../counts/CountTable';
import { GOCountTable } from '../../counts/GOCountTable';

export namespace GOPeptideProcessor
{
    export function process(processedPeptides: ProcessedPeptideContainer): GOCountTable 
    {
        var peptideCounts = processedPeptides.countTable;
        var pept2dataResponse = processedPeptides.response;

        var goCounts = new Map<string, Count>();
        var peptide2go = new Map<string, Set<string>>();

        pept2dataResponse.GetResponse().forEach((data, peptide, _) => 
        {
            let fas = data.fa.data || [];
            let peptideCount = peptideCounts.get(peptide)

            Object.keys(fas)
                .filter(term => term.startsWith("GO:"))
                .forEach(term => 
                    {
                        goCounts.set(term, (goCounts.get(term) || 0) + peptideCount)
                        
                        if(!peptide2go.has(peptide))
                            peptide2go.set(peptide, new Set())
                        peptide2go.get(peptide).add(term)
                    });
        })

        return new GOCountTable(goCounts, peptide2go);
    }
}
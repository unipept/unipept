import {ProcessedPeptideContainer} from '../../ProcessedPeptideContainer';

export interface PeptideProcessor<CountTable>
{
    process(processedPeptides: ProcessedPeptideContainer) : CountTable
}

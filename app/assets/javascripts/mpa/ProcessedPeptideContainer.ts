import {PeptideCountTable} from './counts/PeptideCountTable';
import {Pept2DataResponse} from './api/pept2data/Response';

export class ProcessedPeptideContainer
{
    constructor(
        readonly countTable: PeptideCountTable, 
        readonly response: Pept2DataResponse,
        readonly missed: string[],
        readonly numMatched: number,
        readonly numSearched: number)
    {}
}

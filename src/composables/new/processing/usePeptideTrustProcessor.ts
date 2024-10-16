import {CountTable, PeptideData} from "unipept-web-components";
import {ShareableMap} from "shared-memory-datastructures";

export interface PeptideTrust {
    missedPeptides: string[]
    matchedPeptides: number
    searchedPeptides: number
}

export default function usePeptideTrustProcessor() {
    const process = (
        countTable: CountTable<string>,
        peptideData: ShareableMap<string, PeptideData>
    ): PeptideTrust => {
        let matchedPeptides = 0;
        const missedPeptides: string[] = [];

        for (const peptide of countTable.getOntologyIds()) {
            if (peptideData.has(peptide)) {
                matchedPeptides += countTable.getCounts(peptide);
            } else {
                missedPeptides.push(peptide);
            }
        }

        return {
            missedPeptides,
            matchedPeptides,
            searchedPeptides: countTable.totalCount
        };
    }

    return {
        process
    };
}

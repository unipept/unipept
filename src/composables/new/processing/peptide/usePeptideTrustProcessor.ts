import {PeptideData} from "unipept-web-components";
import {ShareableMap} from "shared-memory-datastructures";
import PeptideTrust from "@/types/PeptideTrust";
import CountTable from "@/logic/new/CountTable";

export default function usePeptideTrustProcessor() {
    const process = (
        countTable: CountTable<string>,
        peptideData: ShareableMap<string, PeptideData>
    ): PeptideTrust => {
        let matchedPeptides = 0;
        const missedPeptides: string[] = [];

        for (const peptide of countTable.keys()) {
            if (peptideData.has(peptide)) {
                matchedPeptides += countTable.getOrDefault(peptide);
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

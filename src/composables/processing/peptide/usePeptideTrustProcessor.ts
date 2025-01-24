import {PeptideData} from "unipept-web-components";
import {ShareableMap} from "shared-memory-datastructures";
import PeptideTrust from "@/types/PeptideTrust";
import CountTable from "@/logic/processors/CountTable";
import {ref} from "vue";

export default function usePeptideTrustProcessor() {
    const trust = ref<PeptideTrust>();

    const process = (
        countTable: CountTable<string>,
        peptideData: ShareableMap<string, PeptideData>
    ): void => {
        let matchedPeptides = 0;
        const missedPeptides: string[] = [];


        for (const peptide of countTable.keys()) {
            if (peptideData.has(peptide)) {
                matchedPeptides += countTable.getOrDefault(peptide);
            } else {
                missedPeptides.push(peptide);
            }
        }

        trust.value = {
            missedPeptides,
            matchedPeptides,
            searchedPeptides: countTable.totalCount
        };
    }

    return {
        trust,

        process
    };
}

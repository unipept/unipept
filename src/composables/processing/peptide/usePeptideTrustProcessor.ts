import PeptideDataV2 from "@/logic/ontology/peptides/PeptideDataV2";
import {ShareableMap} from "shared-memory-datastructures";
import PeptideTrust from "@/types/PeptideTrust";
import CountTable from "@/logic/processors/CountTable";
import {markRaw, ref, shallowRef} from "vue";

export default function usePeptideTrustProcessor() {
    const trust = shallowRef<PeptideTrust>();

    const process = (
        countTable: CountTable<string>,
        peptideData: ShareableMap<string, PeptideDataV2>
    ): void => {
        let matchedPeptides = 0;
        const missedPeptides: string[] = [];

        for (const peptide of countTable.counts.keys()) {
            if (peptideData.has(peptide)) {
                matchedPeptides += countTable.getOrDefault(peptide);
            } else {
                missedPeptides.push(peptide);
            }
        }

        trust.value = markRaw({
            missedPeptides,
            matchedPeptides,
            searchedPeptides: countTable.totalCount
        });
    }

    return {
        trust,
        process
    };
}

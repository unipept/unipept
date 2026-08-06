import CountTable from "@/logic/processors/CountTable";
import PeptideData from "@/logic/ontology/peptides/PeptideData";
import {ShareableMap} from "shared-memory-datastructures";

// Builds the peptide -> terms input expected by FunctionalPeptonizerProcessor, for whichever functional
// category `termExtractor` reads off a peptide's PeptideData (EC codes, GO terms of one namespace, InterPro
// entries, ...). Peptides without any matching terms are omitted.
export default function buildPeptideTermsMap(
    peptideCountTable: CountTable<string>,
    peptideToData: ShareableMap<string, PeptideData>,
    termExtractor: (peptideData: PeptideData) => string[]
): Map<string, string[]> {
    const peptideTerms = new Map<string, string[]>();

    for (const peptide of peptideCountTable.counts.keys()) {
        const data = peptideToData.get(peptide);
        if (!data) {
            continue;
        }

        const terms = termExtractor(data);
        if (terms.length > 0) {
            peptideTerms.set(peptide, terms);
        }
    }

    return peptideTerms;
}

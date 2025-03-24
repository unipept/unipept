import {NcbiTaxon} from "@/logic/ontology/taxonomic/Ncbi";

export default class LcaProcessor {
    /**
     * Computes the lowest common ancestor for the given list of taxa using a matrix-based approach. The lineages of all
     * the provided taxa will be used as the rows of a matrix. Then, the right-most column that contains that same value
     * (different from null or 0) on all rows is the LCA. Returns 1 if no LCA is found (and thus the root is the LCA).
     * 
     * @param taxa All taxa for which the lowest common ancestor should be computed.
     * @return The taxon ID of the lowest common ancestor for the provided input list.
     */
    public computeLca(
        taxa: NcbiTaxon[]
    ): number {
        if (!taxa || taxa.length === 0) {
            return 1;
        }

        // Extract lineages from all taxa 
        const lineages = taxa.map(taxon => taxon.lineage);

        // Start from the rightmost column and find the first column where all values are equal
        for (let col = lineages[0].length - 1; col >= 0; col--) {
            const value = lineages[0][col];
            if (value !== 0 && value !== null && lineages.every(row => row[col] === value)) {
                return value;
            }
        }

        return 1;
    }
}

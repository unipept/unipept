export default interface PeptideInfo {
    sequence: string, // The peptide sequence
    count: number,    // The number of times the peptide occurs
    lca: number,      // The taxon id of the lca
    lineage: number|null[] // The lineage of the lca
}
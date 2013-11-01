# Unipept #

The Unipept web application supports biodiversity analysis of large and complex metaproteome samples.
Its underlying index structure is designed to quickly retrieve all occurrences of a tryptic peptide in UniProtKB records. 
Taxon-specificity of the tryptic peptide is successively derived from these occurrences using a novel lowest common ancestor approach that is robust against taxonomic misarrangements, misidentifications and inaccuracies. 
Not taking into account this identification noise would otherwise result in drastic loss of information. 

## Single peptide analysis ##
With single peptide analysis, you can submit a single tryptic peptide that can be 5 to 50 residues long.
The application will respond with a list of all UniProtKB records wherein the peptide was found along with a complete taxonomic lineage derived from the NCBI taxonomy.
These lineages are presented as a comprehensible table and using an interactive tree view.

## Multi-peptide analysis ##
Multi-peptide analysis helps you analyze lists of tryptic peptides, e.g. extracted from an environmental sample using shotgun tandem mass spectrometric methods.
You can submit a list of peptides of which the lowest common ancestors (LCA) will be calculated.
These LCAs will be bundled and displayed in an interactive treemap giving you insight into the biodiversity of your sample.

## Unique Peptide Finder ##
This application lets you find unique peptides for a species of your choice, based on the data of the completed refseq genomes.
These peptides can be downloaded and used for targeted proteomics experiments.

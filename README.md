# Unipept #

This is a Ruby on Rails frontend for the Unipept database.

The Unipept web application supports biodiversity analysis of large and complex metaproteome samples. Its underlying index structure is designed to quickly retrieve all occurrences of a tryptic peptide in UniProtKB records. Taxon-specificity of the tryptic peptide is successively derived from these occurrences using a novel lowest common ancestor approach that is robust against taxonomic misarrangements, misidentifications and inaccuracies. Not taking into account this identification noise would otherwise result in drastic loss of information. This application consists of two basic functionalities: a peptide-based taxonomic identification and a multi-peptide dynamic diversity treemap analysis.
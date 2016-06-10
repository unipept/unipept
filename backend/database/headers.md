
Headers
=======

Proteome Caches
-------------

Taxons
------
 - ***id***: The taxon's identifier, as assigned by the NCBI. An
   integer number. This column may contain gaps.
 - ***name***: The taxon's name.
 - ***rank***: The taxonomic rank of this taxon. Unranked taxa have
   the `no rank` value. The value should be any of:
   * no rank
   * superkingdom
   * kingdom
   * subkingdom
   * superphylum
   * phylum
   * subphylum
   * superclass
   * class
   * subclass
   * infraclass
   * superorder
   * order
   * suborder
   * infraorder
   * parvorder
   * superfamily
   * family
   * subfamily
   * tribe
   * subtribe
   * genus
   * subgenus
   * species group
   * species subgroup
   * species
   * subspecies
   * varietas
   * forma
 - ***parent***: The taxon id of the parent. Refers to another entry
   in this table (or itself, in case of the root taxon).

EC Numbers
----------
 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***ec number***: The EC number in the form of x.x.x.x.
 - ***name***: The full name of this EC number.

GO Terms
--------
 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***go id***: The GO term id in the form of GO:xxxxxxx.
 - ***name***: The full name of this GO term id.
 - ***name space***: The catagory it belongs to BP, MF, CC.
   * Biological Process
   * Molecular Function
   * Cellular Component

InterPro Entries
----------------
 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***parent id***: The parents id to which it belongs to.
 - ***go id***: The InterPro id in the form of IPRxxxxxx.
 - ***name***: The full name of this IntePro id.
 - ***type***: The catagory it belongs to F, D, R, AS, BS, CS, PTM.
   * Family
   * Domain
   * Repeat
   * Active Site
   * Binding Site
   * Conserved Site
   * Post-translational Modification

IntePro To Gos
--------------
 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***interpro entry id***: The InterPro ids accociated with the GO terms.
 - ***go term id***: The GO terms accociated with the InterPro ids.

KEGG Pathways
-------------
 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***long id***: The KEGG pathway id in the form of mapxxxxx.
 - ***name***: The full name of this KEGG pathway id.

KEGG Pathway Mappings
---------------------
 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***ec number id***: The EC numbers accociated with the KEGG pathways.
 - ***kegg pathway id***: The KEGG pathways accociated with the EC numbers.

GO LCA
------
 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***sequence id***: The peptide sequences id accossiated with the GO lca/il.
 - ***go lca***: The lowest common ancestor for all GO terms accossiated with the specific peptide.
 - ***go lca il***: Same as lca only with the I and L equated

Lineages
--------

 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***taxon id***: Refers to the taxon this lineages indicates the
   lineage of.

Next is a number of taxonomic rank fields, each referring to a taxon
by id. The code is as follows:
 - If the taxon has a valid ancestor with this rank, the value is
   equal to that ancestor's id.
 - If the taxon has an invalid ancestor with this rank, the value is
   the negated value of that ancestor's id.
 - If the taxon has no ancestor with this rank but has an ancestor
   with lower rank (further from root), the value is either \N (null)
   if that lower ancestor is valid, or -1, otherwise.
 - If the taxon has no ancestor with this rank and no ancestors of
   lower rank, the value is \N.

These fields appear in the same order as the values of the taxonomic
rank were mentioned before.

Sequences
---------

Contains the tryptic peptides.

 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***sequence***: An Amino Acid sequence, more precisely a tryptic
   peptide.
 - ***lca***: The lowest common ancestor of all proteins containing
   this tryptic peptide. Refers to the taxon table.
 - ***original lca***: A lowest common ancestor in case we did not
   equate the I and L amino acids.
 - ***ec lca***: The lowest common ancestor for all EC numbers accossiated with the specific peptide.
 - ***ec lca il***: Same as lca only with the I and L equated

Proteomes
---------

- ***id***: A self-assigned id. Integral, incremental, no gaps.
- ***proteome_accession_number***: The Uniprot Proteome Accession number.
- ***proteome_name***: Name of the proteome
- ***taxon _***: The taxon to which this proteome is attributed.
- ***type_strain***: Is this a type strain?
- ***reference_proteome***: Is this a reference proteome?
- ***strain***: The strain number (might be null)
- ***assembly***: The coresponding assembly accession number number (might be null)

Proteome Cross Reference
------------------

 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***uniprot_entry_id***: Which uniprot entry we are referencing.
 - ***proteome_id***: Which proteome we are referencing.

EC Cross References
-------------------

 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***uniprot entry id***: Which uniprot entry we are referencing.
 - ***ec number id***: Which ec number we are referencing.
 - ***ec id***: An EC reference of the uniprot entry.

EMBL Cross References
---------------------

 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***uniprot entry id***: Refers to the uniprot entry this is the
   EMBL reference for.
 - ***protein id***: The EMBL protein id.
 - ***sequence id***: The EMBL Sequence id.

GO Cross References
-------------------

 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***uniprot entry id***: Which uniprot entry we are referencing.
 - ***go term id***: Which go term we are referencing.
 - ***go id***: An GO reference of the uniprot entry.

 Interpro Cross References
--------------------------

 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***uniprot entry id***: Which uniprot entry we are referencing.
 - ***interpro entry id***: Which InterPro we are referencing.
 - ***interpro id***: A InterPro reference of the uniprot entry.

Peptides
--------

Links the sequences back to the proteins they were cut from.

 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***sequence id***: Refers to a sequence in the sequences table.
 - ***original sequence id***: Refers to the same sequence, without
   the I and L equated.
 - ***uniprot entry id***: Refers to the protein these tryptic
   peptides were digested from.

RefSeq Cross References
-----------------------

 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***uniprot entry id***: Refers to the uniprot entry this is the
   refseq reference for.
 - ***protein id***: The RefSeq protein id.
 - ***sequence id***: The RefSeq Sequence id.

Uniprot Entries
---------------

The proteins parsed from uniprot.

 - ***id***: A self-assigned id. Integral, incremental, no gaps.
 - ***uniprot id***: The uniprot accession number of this protein. Not
   a Number.
 - ***version***: The version of this protein.
 - ***taxon id***: Refers to the taxon this protein was gained from.
 - ***type***: Either swissprot of trembl, depending on the source of
   the data.
 - ***name***: Uniprot assigned name of the protein.
 - ***sequence***: The Amino Acid sequence of this protein.

SHELL := /bin/bash

include config

TABLES=                                        \
	$(INTDIR)/peptides.tsv.gz                  \
	$(TABDIR)/uniprot_entries.tsv.gz           \
	$(TABDIR)/refseq_cross_references.tsv.gz   \
	$(TABDIR)/ec_cross_references.tsv.gz       \
	$(TABDIR)/embl_cross_references.tsv.gz     \
	$(TABDIR)/go_cross_references.tsv.gz       \
	$(INTDIR)/proteomes.tsv.gz                 \
	$(TABDIR)/proteome_cross_references.tsv.gz

SRC=$(shell find src/ -type f -name '*.java')
JAR=target/unipept-0.0.1-SNAPSHOT.jar
PAC=org.unipept.tools

all: $(TABDIR)/taxons.tsv.gz $(TABDIR)/lineages.tsv.gz $(TABLES) $(TABDIR)/sequences.tsv.gz $(TABDIR)/peptides.tsv.gz $(TABDIR)/proteomes.tsv.gz
jar: $(JAR)
taxons: $(TABDIR)/taxons.tsv.gz $(TABDIR)/lineages.tsv.gz
tables: $(TABLES)
sequences: $(TABDIR)/sequences.tsv.gz
proteomes: $(TABDIR)/proteomes.tsv.gz
download: $(TAXDIR)/taxdmp.zip $(UNIDIR)/uniprot_sprot.xml.gz $(UNIDIR)/uniprot_trembl.xml.gz

# Compiling {{{ ----------------------------------------------------------------
# TODO:
# - split dependencies for this on the class files.
$(JAR): $(SRC)
	mvn package

%.class: $(JAR)
# }}}

# Downloading {{{ --------------------------------------------------------------
$(TAXDIR)/taxdmp.zip:
	echo "Starting taxon dump download."
	mkdir -p $(TAXDIR)
	-rm -f $@
	wget --no-verbose "$(TAXON_URL)" -O $@
	echo "Finished taxon dump download."

$(INTDIR)/names.dmp $(INTDIR)/nodes.dmp: $(TAXDIR)/taxdmp.zip
	echo "Starting unzipping names and nodes from the taxon dump."
	unzip -DD -o $< $(notdir $@) -d $(dir $@)
	echo "Finished unzipping names and nodes from the taxon dump."

$(UNIDIR)/uniprot_sprot.xml.gz $(UNIDIR)/uniprot_trembl.xml.gz:
	echo "Starting downloading $@."
	mkdir -p $(UNIDIR)
	rm -f $@
	wget --progress=dot:giga "$(UNIPROT_URL)$(notdir $@)" -O $@
	echo "Finished downloading $@."
# }}}

# Taxons and Lineages {{{ ------------------------------------------------------
$(TABDIR)/taxons.tsv.gz $(TABDIR)/lineages.tsv.gz: $(INTDIR)/names.dmp $(INTDIR)/nodes.dmp
	echo "Starting calculation of taxons and lineages tables."
	mkdir -p $(dir $@)
	java $(JMEMMIN) $(JMEMMAX) -cp $(JAR) $(PAC).NamesNodes2TaxonsLineages \
		--names $(INTDIR)/names.dmp \
		--nodes $(INTDIR)/nodes.dmp \
		--taxons >($(GZIP) - > $(TABDIR)/taxons.tsv.gz) \
		--lineages >($(GZIP) - > $(TABDIR)/lineages.tsv.gz)
	echo "Finished calculation of taxons and lineages tables."
# }}}

# Uniprot entries, peptides, sequences and cross references {{{ ----------------
$(TABLES): $(TABDIR)/taxons.tsv.gz $(UNIDIR)/uniprot_sprot.xml.gz
	#$(UNIDIR)/uniprot_trembl.xml.gz
	echo "Started calculation of most tables."
	mkdir -p $(INTDIR)
	java $(JMEMMIN) $(JMEMMAX) -cp $(JAR) $(PAC).TaxonsUniprots2Tables              \
		--peptide-min     $(PEPMIN)                                                 \
		--peptide-max     $(PEPMAX)                                                 \
		--taxons          <(zcat $(TABDIR)/taxons.tsv.gz)                           \
		--peptides        >($(GZIP) - > $(INTDIR)/peptides.tsv.gz)                  \
		--uniprot-entries >($(GZIP) - > $(TABDIR)/uniprot_entries.tsv.gz)           \
		--refseq          >($(GZIP) - > $(TABDIR)/refseq_cross_references.tsv.gz)   \
		--ec              >($(GZIP) - > $(TABDIR)/ec_cross_references.tsv.gz)       \
		--embl            >($(GZIP) - > $(TABDIR)/embl_cross_references.tsv.gz)     \
		--go              >($(GZIP) - > $(TABDIR)/go_cross_references.tsv.gz)       \
		--proteomes       >($(GZIP) - > $(INTDIR)/proteomes.tsv.gz)                 \
		--proteomes-ref   >($(GZIP) - > $(TABDIR)/proteome_cross_references.tsv.gz) \
		swissprot=<(zcat $(UNIDIR)/uniprot_sprot.xml.gz)
	#trembl=<(zcat $(UNIDIR)/uniprot_trembl.xml.gz)
	echo "Finished calculation of most tables."
# }}}

# Sequences with LCA {{{ -------------------------------------------------------
$(INTDIR)/aa_sequence_taxon.tsv.gz: $(INTDIR)/peptides.tsv.gz $(TABDIR)/uniprot_entries.tsv.gz
	echo "Starting the joining of equalized peptides and uniprot entries."
	mkdir -p $(INTDIR)
	join -t '	' -o '1.2,2.2' -j 1 \
			<(zcat $(INTDIR)/peptides.tsv.gz | awk '{ printf("%012d\t%s\n", $$4, $$2) }') \
			<(zcat $(TABDIR)/uniprot_entries.tsv.gz | awk '{ printf("%012d\t%s\n", $$1, $$4) }') \
		| $(SORT) -k1 \
		| $(GZIP) - \
		> $@
	echo "Finished the joining of equalized peptides and uniprot entries."

$(INTDIR)/original_aa_sequence_taxon.tsv.gz: $(INTDIR)/peptides.tsv.gz $(TABDIR)/uniprot_entries.tsv.gz
	echo "Starting the joining of non-equalized peptides and uniprot entries."
	mkdir -p $(INTDIR)
	join -t '	' -o '1.2,2.2' -j 1 \
			<(zcat $(INTDIR)/peptides.tsv.gz | awk '{ printf("%012d\t%s\n", $$4, $$3) }') \
			<(zcat $(TABDIR)/uniprot_entries.tsv.gz | awk '{ printf("%012d\t%s\n", $$1, $$4) }') \
		| $(SORT) -k1 \
		| $(GZIP) - \
		> $@
	echo "Finished the joining of non-equalized peptides and uniprot entries."

$(INTDIR)/sequences.tsv.gz: $(INTDIR)/aa_sequence_taxon.tsv.gz $(INTDIR)/original_aa_sequence_taxon.tsv.gz
	echo "Starting the numbering of sequences."
	$(SORT) -m \
			<(zcat $(INTDIR)/aa_sequence_taxon.tsv.gz | cut -f1) \
			<(zcat $(INTDIR)/original_aa_sequence_taxon.tsv.gz | cut -f1) \
		| uniq \
		| cat -n \
		| sed 's/^ *//' \
		| $(GZIP) - \
		> $@
	echo "Finishing the numbering of sequences."

$(TABDIR)/peptides.tsv.gz: $(INTDIR)/peptides.tsv.gz $(INTDIR)/sequences.tsv.gz
	echo "Starting the substitution of AA's by ID's for the peptides."
	zcat $(INTDIR)/peptides.tsv.gz \
		| $(SORT) -k 2b,2 \
		| join -t '	' -o '1.1,2.1,1.3,1.4' -1 2 -2 2 - <(zcat $(INTDIR)/sequences.tsv.gz) \
		| $(SORT) -k 3b,3 \
		| join -t '	' -o '1.1,1.2,2.1,1.4' -1 3 -2 2 - <(zcat $(INTDIR)/sequences.tsv.gz) \
		| $(SORT) -n \
		| $(GZIP) - \
		> $@
	echo "Finishing the substitution of AA's by ID's for the peptides."

$(INTDIR)/sequence_taxon.tsv.gz: $(INTDIR)/sequences.tsv.gz $(INTDIR)/aa_sequence_taxon.tsv.gz
	echo "Starting the substitution of AA's by ID's for the sequences"
	join -t '	' -o '1.1,2.2' -1 2 -2 1 \
			<(zcat $(INTDIR)/sequences.tsv.gz) \
			<(zcat $(INTDIR)/aa_sequence_taxon.tsv.gz) \
		| $(GZIP) - \
		> $@
	echo "Finishing the substitution of AA's by ID's for the sequences"

$(INTDIR)/original_sequence_taxon.tsv.gz: $(INTDIR)/sequences.tsv.gz $(INTDIR)/original_aa_sequence_taxon.tsv.gz
	echo "Starting the substitution of AA's by ID's for the original sequences"
	join -t '	' -o '1.1,2.2' -1 2 -2 1 \
			<(zcat $(INTDIR)/sequences.tsv.gz) \
			<(zcat $(INTDIR)/original_aa_sequence_taxon.tsv.gz) \
		| $(GZIP) - \
		> $@
	echo "Finishing the substitution of AA's by ID's for the original sequences"

$(INTDIR)/LCAs.tsv.gz: $(TABDIR)/lineages.tsv.gz $(INTDIR)/sequence_taxon.tsv.gz
	echo "Starting the calculation equalized LCA's."
	java $(JMEMMIN) $(JMEMMAX) -cp $(JAR) $(PAC).LineagesSequencesTaxons2LCAs \
		<(zcat $(TABDIR)/lineages.tsv.gz) \
		<(zcat $(INTDIR)/sequence_taxon.tsv.gz) \
		>($(GZIP) - > $(INTDIR)/LCAs.tsv.gz)
	echo "Finished the calculation equalized LCA's."

$(INTDIR)/original_LCAs.tsv.gz: $(TABDIR)/lineages.tsv.gz $(INTDIR)/original_sequence_taxon.tsv.gz
	echo "Starting the calculation non-equalized LCA's."
	java $(JMEMMIN) $(JMEMMAX) -cp $(JAR) $(PAC).LineagesSequencesTaxons2LCAs \
		<(zcat $(TABDIR)/lineages.tsv.gz) \
		<(zcat $(INTDIR)/original_sequence_taxon.tsv.gz) \
		>($(GZIP) - > $(INTDIR)/original_LCAs.tsv.gz)
	echo "Finished the calculation non-equalized LCA's."

$(TABDIR)/sequences.tsv.gz: $(INTDIR)/sequences.tsv.gz $(INTDIR)/LCAs.tsv.gz $(INTDIR)/original_LCAs.tsv.gz
	echo "Starting the creation of the sequences table."
	zcat $(INTDIR)/sequences.tsv.gz \
		| join --nocheck-order -a1 -t '	' -o "1.1 1.2 2.2" - <(zcat $(INTDIR)/original_LCAs.tsv.gz) \
		| join --nocheck-order -a1 -t '	' -o "1.1 1.2 1.3 2.2" - <(zcat $(INTDIR)/LCAs.tsv.gz) \
		| $(GZIP) - \
		> $@
	echo "Finished the creation of the sequences table."

# }}}

# Proteomes {{{ ----------------------------------------------------------------
$(TABDIR)/proteomes.tsv.gz: $(INTDIR)/proteomes.tsv.gz proteomes.sh type_strains.sh
	echo "Starting fetching proteome info."
	./proteomes.sh \
		$(INTDIR)/proteomes.tsv.gz \
		<(ENTREZ_URL=$(ENTREZ_URL) ENTREZ_BATCH_SIZE=$(ENTREZ_BATCH_SIZE) ./type_strains.sh) \
		$(TABDIR)/proteomes.tsv.gz
	echo "Finished fetching proteome info."
# }}}

.PHONY: clean_intermediates
clean_intermediates:
	rm -vf $(INTDIR)/*

.PHONY: clean
clean: clean_intermediates
	rm -vf $(TABDIR)/*

.PHONY: pristine
pristine: clean
	rm -vf $(JAR)
	rm -vf $(TAXDIR)/taxdmp.zip
	rm -vf $(UNIDIR)/uniprot_sprot.xml.gz $(UNIDIR)/uniprot_treml.xml.gz


# vim: foldmethod=marker

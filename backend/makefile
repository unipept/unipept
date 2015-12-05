SHELL := /bin/bash

include config

TABLES=                                        \
	$(TABDIR)/peptides.tsv.gz                  \
	$(INTDIR)/sequences.tsv.gz                 \
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

all: $(TABDIR)/taxons.tsv.gz $(TABDIR)/lineages.tsv.gz $(TABLES) $(TABDIR)/sequences.tsv.gz $(TABDIR)/proteomes.tsv.gz
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

$(TAXDIR)/names.dmp $(TAXDIR)/nodes.dmp: $(TAXDIR)/taxdmp.zip
	echo "Starting unzipping names and nodes from the taxon dump."
	unzip -o $< $(notdir $@) -d $(dir $@)
	echo "Finished unzipping names and nodes from the taxon dump."

$(UNIDIR)/uniprot_sprot.xml.gz $(UNIDIR)/uniprot_trembl.xml.gz:
	echo "Starting downloading $@."
	mkdir -p $(UNIDIR)
	rm -f $@
	wget --progress=dot:giga "$(UNIPROT_URL)$(notdir $@)" -O $@
	echo "Finished downloading $@."
# }}}

# Taxons and Lineages {{{ ------------------------------------------------------
$(TABDIR)/taxons.tsv.gz $(TABDIR)/lineages.tsv.gz: $(TAXDIR)/names.dmp $(TAXDIR)/nodes.dmp
	echo "Starting calculation of taxons and lineages tables."
	mkdir -p $(dir $@)
	java $(JMEMMIN) $(JMEMMAX) -cp $(JAR) $(PAC).NamesNodes2TaxonsLineages $(TAXDIR)/names.dmp $(TAXDIR)/nodes.dmp $(TABDIR)/taxons.tsv.gz $(TABDIR)/lineages.tsv.gz
	echo "Finished calculation of taxons and lineages tables."
# }}}

# Uniprot entries, peptides, sequences and cross references {{{ ----------------
$(TABLES): $(TABDIR)/taxons.tsv.gz $(UNIDIR)/uniprot_sprot.xml.gz $(UNIDIR)/uniprot_trembl.xml.gz
	echo "Started calculation of most tables."
	mkdir -p $(BDBDIR)
	mkdir -p $(INTDIR)
	#java $(JMEMMIN) $(JMEMMAX) -cp $(JAR) $(PAC).TaxonsUniprots2Tables $(BDBDIR) $(BDBMEM) $(TABDIR)/taxons.tsv.gz $(TABLES) $(UNIDIR)/uniprot_sprot.xml.gz "swissprot"
	java $(JMEMMIN) $(JMEMMAX) -cp $(JAR) $(PAC).TaxonsUniprots2Tables $(BDBDIR) $(BDBMEM) $(TABDIR)/taxons.tsv.gz $(TABLES) $(UNIDIR)/uniprot_sprot.xml.gz "swissprot" $(UNIDIR)/uniprot_trembl.xml.gz "trembl"
	echo "Finished calculation of most tables."
# }}}

# Sequences with LCA {{{ -------------------------------------------------------
$(INTDIR)/sequence_taxon.tsv.gz: $(TABDIR)/peptides.tsv.gz $(TABDIR)/uniprot_entries.tsv.gz
	echo "Starting the joining of equalized peptides and uniprot entries."
	mkdir -p $(INTDIR)
	join -t '	' -o '1.2,2.4' -1 4 -2 1 \
			<(zcat $(TABDIR)/peptides.tsv.gz) \
			<(zcat $(TABDIR)/uniprot_entries.tsv.gz) \
		| sort -S 20% -k1n \
		| gzip - \
		> $@
	echo "Finished the joining of equalized peptides and uniprot entries."

$(INTDIR)/original_sequence_taxon.tsv.gz: $(TABDIR)/peptides.tsv.gz $(TABDIR)/uniprot_entries.tsv.gz
	echo "Starting the joining of non-equalized peptides and uniprot entries."
	mkdir -p $(INTDIR)
	join -t '	' -o '1.3,2.4' -1 4 -2 1 \
			<(zcat $(TABDIR)/peptides.tsv.gz) \
			<(zcat $(TABDIR)/uniprot_entries.tsv.gz) \
		| sort -S 20% -k1n \
		| gzip - \
		> $@
	echo "Finished the joining of non-equalized peptides and uniprot entries."

$(INTDIR)/LCAs.tsv.gz: $(TABDIR)/lineages.tsv.gz $(INTDIR)/sequence_taxon.tsv.gz
	echo "Starting the calculation equalized LCA's."
	java $(JMEMMIN) $(JMEMMAX) -cp $(JAR) $(PAC).LineagesSequencesTaxons2LCAs $^ $@
	echo "Finished the calculation equalized LCA's."

$(INTDIR)/original_LCAs.tsv.gz: $(TABDIR)/lineages.tsv.gz $(INTDIR)/original_sequence_taxon.tsv.gz
	echo "Starting the calculation non-equalized LCA's."
	java $(JMEMMIN) $(JMEMMAX) -cp $(JAR) $(PAC).LineagesSequencesTaxons2LCAs $^ $@
	echo "Finished the calculation non-equalized LCA's."

$(TABDIR)/sequences.tsv.gz: $(INTDIR)/sequences.tsv.gz $(INTDIR)/LCAs.tsv.gz $(INTDIR)/original_LCAs.tsv.gz
	echo "Starting the creation of the sequences table."
	zcat $(INTDIR)/sequences.tsv.gz \
		| join --nocheck-order -a1 -t '	' -o "1.1 1.2 2.2" - <(zcat $(INTDIR)/original_LCAs.tsv.gz) \
		| join --nocheck-order -a1 -t '	' -o "1.1 1.2 1.3 2.2" - <(zcat $(INTDIR)/LCAs.tsv.gz) \
		| gzip - \
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
	rm -vf $(TAXDIR)/names.dmp $(TAXDIR)/nodes.dmp

.PHONY: clean
clean: clean_intermediates
	rm -vf $(TABDIR)/taxons.tsv.gz $(TABDIR)/lineages.tsv.gz
	rm -vf $(TABDIR)/proteomes.tsv.gz
	rm -vf $(TABLES)

.PHONY: pristine
pristine: clean
	rm -vf $(JAR)
	rm -vf $(TAXDIR)/taxdmp.zip
	rm -vf $(UNIDIR)/uniprot_sprot.xml.gz $(UNIDIR)/uniprot_treml.xml.gz


# vim: foldmethod=marker

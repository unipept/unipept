SHELL := /bin/bash

DATADIR=../../data
TABDIR=$(DATADIR)/tables
UNIDIR=$(DATADIR)/uniprot
TAXDIR=$(DATADIR)/taxon
GENDIR=$(DATADIR)/genome
INTDIR=$(DATADIR)/intermediate

JMEM=-Xmx3g
BDBMEM=500000000
#JMEM=-Xms140g -Xmx150g
#BDBMEM=100000000000
BDBDIR=../../berkeleydb

TABLES=                                      \
	$(TABDIR)/peptides.tsv.gz                \
	$(INTDIR)/sequences.tsv.gz               \
	$(TABDIR)/uniprot_entries.tsv.gz         \
	$(TABDIR)/refseq_cross_references.tsv.gz \
	$(TABDIR)/ec_cross_references.tsv.gz     \
	$(TABDIR)/embl_cross_references.tsv.gz   \
	$(TABDIR)/go_cross_references.tsv.gz
GENOME_TABLES=genomes.tsg.gz genome_cache.tsv.gz

SRC=$(shell find src/ -type f -name '*.java')
JAR=target/unipept-0.0.1-SNAPSHOT.jar
PAC=org.unipept.tools

all: $(JAR) $(TABDIR)/taxons.tsv.gz $(TABLES) $(TABDIR)/sequences.tsv.gz $(TABDIR)/assemblies.tsv.gz $(TABDIR)/genome_sequences.tsv.gz
	date +"%Y-%m-%d %H:%M:%S"

# Compiling {{{ ----------------------------------------------------------------
# TODO:
# - split dependencies for this on the class files.
$(JAR): $(SRC)
	date +"%Y-%m-%d %H:%M:%S"
	mvn package

%.class: $(JAR)
# }}}

# Downloading {{{ --------------------------------------------------------------
$(TAXDIR)/taxdmp.zip:
	date +"%Y-%m-%d %H:%M:%S"
	mkdir -p $(TAXDIR)
	-rm -f $@
	wget ftp://ftp.ncbi.nih.gov/pub/taxonomy/taxdmp.zip -O $@

$(TAXDIR)/names.dmp $(TAXDIR)/nodes.dmp: $(TAXDIR)/taxdmp.zip
	date +"%Y-%m-%d %H:%M:%S"
	unzip -DDo $< $(notdir $@) -d $(dir $@)

#$(UNIDIR)/uniprot_sprot.xml.gz $(UNIDIR)/uniprot_trembl.xml.gz:
$(UNIDIR)/uniprot_sprot.xml.gz:
	date +"%Y-%m-%d %H:%M:%S"
	mkdir -p $(UNIDIR)
	rm -f $@
	wget -q ftp://ftp.expasy.org/databases/uniprot/current_release/knowledgebase/complete/$(notdir $@) -O $@
# }}}

# Taxons and Lineages {{{ ------------------------------------------------------
$(TABDIR)/taxons.tsv.gz $(TABDIR)/lineages.tsv.gz: $(TAXDIR)/names.dmp $(TAXDIR)/nodes.dmp
	date +"%Y-%m-%d %H:%M:%S"
	mkdir -p $(dir $@)
	java $(JMEM) -cp $(JAR) $(PAC).NamesNodes2TaxonsLineages $(TAXDIR)/names.dmp $(TAXDIR)/nodes.dmp $(TABDIR)/taxons.tsv.gz $(TABDIR)/lineages.tsv.gz
# }}}

# Uniprot entries, peptides, sequences and cross references {{{ ----------------
$(TABLES): $(TABDIR)/taxons.tsv.gz $(UNIDIR)/uniprot_sprot.xml.gz
	date +"%Y-%m-%d %H:%M:%S"
	mkdir -p $(BDBDIR)
	mkdir -p $(INTDIR)
	java $(JMEM) -cp $(JAR) $(PAC).TaxonsUniprots2Tables $(BDBDIR) $(BDBMEM) $(TABDIR)/taxons.tsv.gz $(TABLES) $(UNIDIR)/uniprot_sprot.xml.gz "swissprot"
	#java $(JMEM) -cp $(JAR) $(PAC).TaxonsUniprots2Tables $(BDBDIR) $(BDBMEM) $(TABDIR)/taxons.tsv.gz $(TABLES) $(UNIDIR)/uniprot_sprot.xml.gz "swissprot" $(UNIDIR)/uniprot_trembl.xml.gz "trembl"
# }}}

# Sequences with LCA {{{ -------------------------------------------------------
# TODO:
# - if the lcaCalculator used stdin/out, all of calculate_lcas.sh could be
#   piped.
#
$(INTDIR)/sequence_taxon.tsv.gz: $(TABDIR)/peptides.tsv.gz $(TABDIR)/uniprot_entries.tsv.gz
	date +"%Y-%m-%d %H:%M:%S"
	mkdir -p $(INTDIR)
	join -t '	' -o '1.2,2.4' -1 4 -2 1 \
			<(zcat $(TABDIR)/peptides.tsv.gz) \
			<(zcat $(TABDIR)/uniprot_entries.tsv.gz) \
		| sort -S 20% -k1n \
		| gzip - \
		> $@

$(INTDIR)/original_sequence_taxon.tsv.gz: $(TABDIR)/peptides.tsv.gz $(TABDIR)/uniprot_entries.tsv.gz
	date +"%Y-%m-%d %H:%M:%S"
	mkdir -p $(INTDIR)
	join -t '	' -o '1.3,2.4' -1 4 -2 1 \
			<(zcat $(TABDIR)/peptides.tsv.gz) \
			<(zcat $(TABDIR)/uniprot_entries.tsv.gz) \
		| sort -S 20% -k1n \
		| gzip - \
		> $@

$(INTDIR)/LCAs.tsv.gz: $(TABDIR)/lineages.tsv.gz $(INTDIR)/sequence_taxon.tsv.gz
	date +"%Y-%m-%d %H:%M:%S"
	java $(JMEM) -cp $(JAR) $(PAC).LineagesSequencesTaxons2LCAs $^ $@

$(INTDIR)/original_LCAs.tsv.gz: $(TABDIR)/lineages.tsv.gz $(INTDIR)/original_sequence_taxon.tsv.gz
	date +"%Y-%m-%d %H:%M:%S"
	java $(JMEM) -cp $(JAR) $(PAC).LineagesSequencesTaxons2LCAs $^ $@

$(TABDIR)/sequences.tsv.gz: $(INTDIR)/sequences.tsv.gz $(INTDIR)/LCAs.tsv.gz $(INTDIR)/original_LCAs.tsv.gz
	date +"%Y-%m-%d %H:%M:%S"
	zcat $(INTDIR)/sequences.tsv.gz \
		| join --nocheck-order -a1 -t '	' -o "1.1 1.2 2.2" - <(zcat $(INTDIR)/original_LCAs.tsv.gz) \
		| join --nocheck-order -a1 -t '	' -o "1.1 1.2 1.3 2.2" - <(zcat $(INTDIR)/LCAs.tsv.gz) \
		| gzip - \
		> $@
# }}}

# Genome tables {{{ ------------------------------------------------------------
$(TABDIR)/assemblies.tsv.gz $(TABDIR)/genome_sequences.tsv.gz: parse_assemblies.awk
	date +"%Y-%m-%d %H:%M:%S"
	mkdir -p $(GENDIR)
	rsync --ignore-existing 'rsync://ftp.ncbi.nlm.nih.gov/genomes/ASSEMBLY_REPORTS/All/*.assembly.txt' $(GENDIR)
	find $(GENDIR) -name 'GCA_*.assembly.txt' \
		| xargs awk -f parse_assemblies.awk \
			-v assemblies_file=>(gzip - > $(TABDIR)/assemblies.tsv.gz) \
			-v genome_sequences_file=>(gzip - > $(TABDIR)/genome_sequences.tsv.gz)
# }}}

.PHONY: clean
clean:
	rm -f $(JAR)
	rm -f $(TAXDIR)/names.dmp $(TAXDIR)/nodes.dmp
	rm -f $(TABDIR)/taxons.tsv.gz $(TABDIR)/lineages.tsv.gz
	rm -f $(TABLES)
	rm -f $(INTDIR)/*
	rm -f $(TABDIR)/lcad_sequences.tsv.gz

new: clean
	rm -f $(TAXDIR)/taxdmp.zip
	rm -f $(UNIDIR)/uniprot_sprot.xml.gz $(UNIDIR)/uniprot_treml.xml.gz
	rm -f $(GENDIR)/*.assembly.txt


# vim: foldmethod=marker

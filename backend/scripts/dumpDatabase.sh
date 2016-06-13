function print {
    echo $(date -u) $1
}

datadir="."
currentdir=`pwd`
mkdir -p "${datadir}"

print "Dumping ec_cross_references"
echo "select * from ec_cross_references order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/ec_cross_references.tsv.gz"

print "Dumping embl_cross_references"
echo "select * from embl_cross_references order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/embl_cross_references.tsv.gz"

print "Dumping go_cross_references"
echo "select * from go_cross_references order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/go_cross_references.tsv.gz"

print "Dumping lineages"
echo "select * from lineages order by taxon_id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/lineages.tsv.gz"

print "Dumping peptides"
echo "select * from peptides order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/peptides.tsv.gz"

print "Dumping refseq_cross_references"
echo "select * from refseq_cross_references order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/refseq_cross_references.tsv.gz"

print "Dumping sequences"
echo "select * from sequences order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/sequences.tsv.gz"

print "Dumping taxons"
echo "select * from taxons order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/taxons.tsv.gz"

print "Dumping uniprot_entries"
echo "select * from uniprot_entries order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/uniprot_entries.tsv.gz"

print "Dumping intepro_entries"
echo "select * from intepro_entries order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/uniprot_entries.tsv.gz"

print "Dumping go_terms"
echo "select * from go_terms order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/uniprot_entries.tsv.gz"

print "Dumping ec_numbers"
echo "select * from ec_numbers order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/uniprot_entries.tsv.gz"

print "Dumping kegg_pathways"
echo "select * from kegg_pathways order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/uniprot_entries.tsv.gz"

print "Dumping kegg_pathway_mappings"
echo "select * from kegg_pathway_mappings order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/uniprot_entries.tsv.gz"

print "Dumping interpro_to_gos"
echo "select * from interpro_to_gos order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/uniprot_entries.tsv.gz"

print "Dumping go_lcas"
echo "select * from go_lcas order by id;" | mysql -u unipept -punipept unipept -q --skip-column-names | sed "s/NULL/\\\N/g" | gzip - > "${datadir}/uniprot_entries.tsv.gz"


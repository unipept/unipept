function print {
    echo $(date -u) $1
}

datadir="../data/dump"
currentdir=`pwd`
mkdir -p "${datadir}"

print "Dumping ec_cross_references"
echo "select * from ec_cross_references order by id;" | mysql -u unipept -punipept unipept -q | gzip - > "${datadir}/ec_cross_references.tsv.gz"

print "Dumping embl_cross_references"
echo "select * from embl_cross_references order by id;" | mysql -u unipept -punipept unipept -q | gzip - > "${datadir}/embl_cross_references.tsv.gz"

print "Dumping go_cross_references"
echo "select * from go_cross_references order by id;" | mysql -u unipept -punipept unipept -q | gzip - > "${datadir}/go_cross_references.tsv.gz"

print "Dumping lineages"
echo "select * from lineages order by taxon_id;" | mysql -u unipept -punipept unipept -q | gzip - > "${datadir}/lineages.tsv.gz"

print "Dumping peptides"
echo "select * from peptides order by id;" | mysql -u unipept -punipept unipept -q | gzip - > "${datadir}/peptides.tsv.gz"

print "Dumping refseq_cross_references"
echo "select * from refseq_cross_references order by id;" | mysql -u unipept -punipept unipept -q | gzip - > "${datadir}/refseq_cross_references.tsv.gz"

print "Dumping sequences"
echo "select * from sequences order by id;" | mysql -u unipept -punipept unipept -q | gzip - > "${datadir}/sequences.tsv.gz"

print "Dumping taxons"
echo "select * from taxons order by id;" | mysql -u unipept -punipept unipept -q | gzip - > "${datadir}/taxons.tsv.gz"

print "Dumping uniprot_entries"
echo "select * from uniprot_entries order by id;" | mysql -u unipept -punipept unipept -q | gzip - > "${datadir}/uniprot_entries.tsv.gz"
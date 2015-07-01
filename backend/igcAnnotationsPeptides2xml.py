
import sys

HEADER = """\
<?xml version="1.0" encoding="UTF-8"?>
<uniprot xmlns="http://uniprot.org/uniprot"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://uniprot.org/uniprot http://www.uniprot.org/support/docs/uniprot.xsd">"""

ENTRY = """
<entry version="1">
  <organism>
    <dbReference type="NCBI Taxonomy" id="{taxon_id}"/>
  </organism>
  <recommendedName>
    <fullName>{gene_name}</fullName>
  </recommendedName>
  <sequence>{sequence}</sequence>
  <dbReference id="{kegg_anno}" type="KEGG" />
  <dbReference id="{eggnog_anno}" type="EggNOG" />
  <accession>{gene_id}</accession>
</entry>"""

FOOTER = """
</uniprot>"""

PARSED_ENTRY = """
<entry version="Version">
  <organism>
    <dbReference type="NCBI Taxonomy">TaxonId</dbReference>
  </organism>
  <evidence>
    Here be dbReferences!
  </evidence>
  <recommendedName>
    <fullName>name</fullName>
  </recommendedName>
  <sequence>Sequence</sequence>
  <dbReference type="EMBL || RefSeq || GO || EC" id="Id">
    <property type="protein sequence ID || nucleotide sequence ID" value="dbRef.setProteinId($$) || dbRef.setSequenceId($$)" />
  </dbReference>
  <accession>UniprotAccessionNumber</accession>
</entry>"""

def _skipzip(seq1, seq2, key1=None, key2=None):
    """
    Zips the two sequences, skipping lines from seq1 if the keys
    (default identity functions) give none-equal output.
    """
    key1 = key1 or (lambda x: x)
    key2 = key2 or (lambda x: x)
    seq1 = iter(seq1)
    for e2 in seq2:
        e1 = next(seq1)
        while key1(e1) != key2(e2):
            e1 = next(seq1)
        yield e1, e2

def _paired(seq):
    i = iter(seq)
    while True:
        yield next(i), next(i)

def parse_annotations(annofile):
    with open(annofile) as annotations:
        for line in annotations:
            annotation = line.rstrip().split('\t')
            gene_id, gene_name, gene_length, gene_completeness = annotation[0:4]
            origin, phylum, genus, kegg_anno, eggnog_anno, sample_freq = annotation[4:10]
            indi_freq, kegg_funcs, eggnog_funcs, assembled = annotation[10:]
            if genus == 'unknown': genus = None
            if phylum == 'unknown': phylum = None
            yield gene_id, gene_name, kegg_anno, eggnog_anno, genus or phylum or None

def parse_peptides(peptfile):
    with open(peptfile) as peptides:
        for headerline, peptide in _paired(peptides):
            #name, kind, locus, status, codon = headerline.rstrip().split()
            name, *_ = headerline.rstrip().split()
            name = name[1:]
            yield name, peptide.rstrip()

def parse_taxons(taxonssfile):
    with open(taxonssfile) as taxons:
        for line in taxons:
            id_, name, rank, parent, valid = line.rstrip().split('\t')
            yield int(id_), name, rank

def main(annofile, peptfile, taxonssfile, outfile):
    with open(outfile, 'w') as output:
        print(HEADER, file=output)
        annotations = parse_annotations(annofile)
        peptides = parse_peptides(peptfile)
        taxons = {
            name: id_
            for id_, name, rank in parse_taxons(taxonssfile)
            if rank in ("genus", "phylum")
        }
        for annotation, peptide in zip(annotations, peptides):
            print(ENTRY.format(
                gene_id=annotation[0],
                gene_name=annotation[1],
                kegg_anno=annotation[2],
                eggnog_anno=annotation[3],
                taxon_id=taxons.get(annotation[4], 1),
                sequence=peptide[1]), file=output)
        print(FOOTER, file=output)

if __name__ == '__main__':
    main(*sys.argv[1:])

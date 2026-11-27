---
title: uniprot
subtitle: Fetches UniProt entries based on their accession numbers.
---

The `uniprot` command takes one or more UniProt accession numbers and returns the corresponding UniProt entry for each
of the accession numbers as output. This information is fetched by using the UniProt webservice.

## Input {#input}

The `uniprot` command expects UniProt accession numbers as input. The source of this input can be command line arguments
or standard input. If input is supplied using multiple sources at the same time, the order of priority as described
above is used.

### Command line arguments

If input is supplied using command line arguments, the accession numbers must be separated by spaces.

#### Example

```console
$ uniprot C6JD41 Q06JG4
MTLVPLGDRVVLKQVEAEETTKSGIVLPGQAQEKPQQAEVVAVGPGGVVDGKEVKMEVAVGDKVIYSKYSGTEVKMDGTEYIIVKQNDILAIVK
MFTNSIKNLIIYLMPLMVTLMLLSVSFVDAGKKPSGPNPGGNN
```

### Standard input

If the command is run without arguments, `uniprot` will read its input from *standard input*. When *standard input* is
used, a single UniProt accession number per line is expected.

#### Example

```console
$ cat input.txt
C6JD41
Q06JG4
$ cat input | uniprot
MTLVPLGDRVVLKQVEAEETTKSGIVLPGQAQEKPQQAEVVAVGPGGVVDGKEVKMEVAVGDKVIYSKYSGTEVKMDGTEYIIVKQNDILAIVK
MFTNSIKNLIIYLMPLMVTLMLLSVSFVDAGKKPSGPNPGGNN
```

## Output {#output}

The `uniprot` command outputs the UniProt entry for each of the input accession numbers. By default, only the protein
sequences are returned. By using the [--format parameter](#options), this can be changed to fasta, txt, xml, rdf or gff.
All output is written to *standard output*.

## Command-line options {#options}

### --format / -f

*Specify the output format*

By default, the `uniprot` command only returns the protein sequence of the UniProt entry. The `--format` option allows
you to select another format. Supported formats are sequence, fasta, txt, xml, rdf, and gff.

#### Example

```console
$ uniprot --format fasta C6JD41 Q06JG4
>tr|C6JD41|C6JD41_9FIRM 10 kDa chaperonin OS=Ruminococcus sp. 5_1_39BFAA GN=groS PE=3 SV=1
MTLVPLGDRVVLKQVEAEETTKSGIVLPGQAQEKPQQAEVVAVGPGGVVDGKEVKMEVAV
GDKVIYSKYSGTEVKMDGTEYIIVKQNDILAIVK
>sp|Q06JG4|16D10_MELHA CLAVATA3/ESR (CLE)-related protein 16D10 OS=Meloidogyne hapla GN=16D10 PE=2 SV=1
MFTNSIKNLIIYLMPLMVTLMLLSVSFVDAGKKPSGPNPGGNN
```

### --input / -i

*Read input from a file*

By default, input is read from *standard input*. The `--input` option reads it from a file instead. The option may be
given more than once, in which case the files are read one after the other as a single stream.

#### Example

```console
$ uniprot --input accessions1.txt --input accessions2.txt
```

### --output / -o

*Write output to a file*

By default, output is written to *standard output*. The `--output` option writes it to a file instead. An existing file
is overwritten.

#### Example

```console
$ uniprot --output results.txt
```

### --version / -V

*Display the version*

Prints the version of the Unipept CLI and exits.

### --help / -h

*Display help*

This flag displays the help.


---
title: unipept pept2ec
subtitle: Returns the functional EC-numbers associated with a given tryptic peptide.
---

The `unipept pept2ec` command takes one or more tryptic peptides as input and returns a list of EC-numbers for each of
them as output. The EC-numbers are all derived from the UniProt entries that contain the given peptide. All this
information is fetched by doing [API-requests](../apidocs/pept2ec.md) to the Unipept server.

## Input {#input}

The `unipept pept2ec` command expects tryptic peptides as input. The source of this input can be command line arguments,
a file, or *standard input*. If input is supplied using multiple sources at the same time, the order of priority as
described above is used.

### Command line arguments

If input is supplied using command line arguments, the accession numbers must be separated by spaces.

#### Example

```console
$ unipept pept2ec AALTER MDGTEYIIVK
peptide,total_protein_count,ec_number,ec_protein_count
AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
MDGTEYIIVK,4,,
```

### File input

Use the [--input parameter](#options) to specify a file to use as input. If input is supplied using a file, a single
peptide per line is expected.

#### Example

```console
$ cat input.txt
AALTER
MDGTEYIIVK
$ unipept pept2ec --input input.txt
peptide,total_protein_count,ec_number,ec_protein_count
AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
MDGTEYIIVK,4,,
```

### Standard input

If the command is run without arguments and no file is specified, `unipept pept2ec` will read its input from *standard
input*. When *standard input* is used, a single peptide per line is expected.

#### Example

```console
$ cat input.txt
AALTER
MDGTEYIIVK
$ cat input | unipept pept2funct
peptide,total_protein_count,ec_number,ec_protein_count
AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
MDGTEYIIVK,4,,
```

## Output {#output}

The `unipept pept2ec` command outputs the list of associated EC-numbers for each of the (tryptic) input peptides that
were found in the Unipept database. By default, the EC-number and peptide count are returned. By using the [--all
parameter](#options), this can be supplemented with the name of the EC-number. Consult the [API
documentation](../apidocs/pept2ec.md) for a detailed list of output fields. A selection of output fields can be
specified with the [--select parameter](#options). By default, output is generated in csv format. By using the [--format
parameter](#options), the format can be changed into json or xml. The output can be written to a file or to *standard
output*.

### File output

Use the [--output parameter](#options) to specify an output file. If the file aready exists, the output will be appended
to the end of the file.

#### Example

```console
$ unipept pept2ec --output output.txt AALTER MDGTEYIIVK
$ cat output.txt
peptide,total_protein_count,ec_number,ec_protein_count
AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
MDGTEYIIVK,4,,
```

### Standard output

If no output file is specified, `unipept pept2ec` will write its output to *standard output*.

#### Example

```console
$ unipept pept2ec AALTER MDGTEYIIVK
peptide,total_protein_count,ec_number,ec_protein_count
AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
MDGTEYIIVK,4,,
$ unipept pept2go AALTER MDGTEYIIVK > output.txt
$ cat output.txt
peptide,total_protein_count,ec_number,ec_protein_count
AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
MDGTEYIIVK,4,,
```

## Fasta support {#fasta}

The `unipept pept2ec` command supports input (from any source) in a fasta-like format (for example generated by the
[prot2pept command](./prot2pept.md)). This format consists of a fasta header (a line starting with a >), followed by one
or more lines containing one peptide each. When this format is detected, the output will automatically include an extra
information field containing the corresponding fasta header.

#### Example

```console
$ cat input.txt
> header 1
AALTER
MDGTEYIIVK
> header 2
AALTER
$ unipept pept2ec --input input.txt
fasta_header,peptide,total_protein_count,ec_number,ec_protein_count
> header 1,AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
> header 1,MDGTEYIIVK,4,,
> header 2,AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
```

## Command-line options {#options}

### --equate / -e

*Equate isoleucine and leucine*

If the `--equate` flag is set, isoleucine (I) and leucine (L) are equated when matching tryptic peptides to UniProt
entries. This is similar to checking the *Equate I and L?* checkbox when performing a search in the Unipept web
interface.

#### Example

```console
$ unipept pept2ec LLELGAPDLLVR
$ unipept pept2ec --equate LLELGAPDLLVR
peptide,total_protein_count,ec_number,ec_protein_count
LLELGAPDLLVR,499,2.7.7.6,495
```

### --input / -i

*Specify an input file*

All Unipept CLI commands can process input from 3 sources: command line arguments, a file, or *standard input*. The
optional `--input` option allows you to specify an input file. The file should contain a single peptide per line. The
option may be given more than once, in which case the files are read one after the other as a single stream.

#### Example

```console
$ cat input.txt
AALTER
OMGWTFBBQ
MDGTEYIIVK
$ unipept pept2ec --input input.txt
peptide,total_protein_count,ec_number,ec_protein_count
AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
MDGTEYIIVK,4,,
```

### --output / -o

*Specify an output file*

By default, the unipept commands write their output to *standard output*. Using the optional `--output` option allows
you to specify a file to write the output to. If the file already exists, it is overwritten; if it doesn't, a new file
will be created.

#### Example

```console
$ unipept pept2ec --output output.txt AALTER
$ cat output.txt
peptide,total_protein_count,ec_number,ec_protein_count
AALTER,1425,2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15 2.3.1.234 2.1.1.13 4.2.1.17 6.3.2.8 3.1.3.3 2.7.4.16 2.4.-.- 5.3.1.1 3.1.4.- 2.8.1.7 6.5.1.2 6.1.1.2 3.4.11.10 3.4.11.1 1.1.1.100 6.3.2.10 3.6.4.- 6.1.1.23 3.1.1.61 3.1.1.4 2.7.1.50 2.7.1.48 1.8.1.2 2.6.1.- 3.4.-.- 2.4.1.227 6.3.4.2 6.3.4.4 4.1.2.- 1.10.9.1 1.14.13.- 2.5.1.- 2.6.1.16 3.1.-.- 4.2.1.153 3.1.2.6 4.6.1.17 2.4.1.- 2.5.1.75 4.2.1.3 6.3.2.31 6.3.2.34 6.3.3.2 1.2.1.2 5.2.1.8 4.99.1.1 2.3.2.2 2.-.-.- 2.7.3.9 4.1.3.27 1.1.1.262 5.4.99.2 2.7.7.59 3.1.21.3 4.2.99.20 6.1.1.12 1.7.99.4,111 11 11 8 8 7 6 4 4 3 3 3 3 3 3 2 2 2 2 2 2 2 2 2 2 2 2 2 2 2 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
```

### --select / -s

*Specify the output fields*

By default, the Unipept CLI commands output all information fields received from the Unipept server. The `--select`
option allows you to control which fields are returned. A list of fields can be specified by a comma-separated list, or
by using multiple `--select` options. A `*` can be used as a wildcard for field names. For example, `--select
peptide,taxon*` will return the peptide field and all fields starting with taxon.

#### Example

```console
$ unipept pept2ec --select peptide,ec_number AALTER
ec_number,peptide
2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15,AALTER
$ unipept pept2ec --select peptide --select *name AALTER
ec_number,peptide
2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15,AALTER
```

### --format / -f

*Specify the output format*

By default, the Unipept CLI commands return their output in csv format. The `--format` option allows you to select
another format. Supported formats are csv, json, and xml.

#### Example

```console
$ unipept pept2ec --format json AALTER MDGTEYIIVK
[{"ec":[{"ec_number":"2.3.2.27","protein_count":111},{"ec_number":"2.7.13.3","protein_count":11},{"ec_number":"6.2.1.3","protein_count":11},{"ec_number":"6.1.1.6","protein_count":8},{"ec_number":"6.3.2.13","protein_count":8},{"ec_number":"2.7.4.25","protein_count":7},{"ec_number":"6.1.1.22","protein_count":6},{"ec_number":"3.1.26.-","protein_count":4},{"ec_number":"2.3.1.29","protein_count":4},{"ec_number":"2.7.1.15","protein_count":3}],"peptide":"AALTER","total_protein_count":1425},{"peptide":"MDGTEYIIVK","total_protein_count":4}]
$ unipept pept2lca --format xml AALTER MDGTEYIIVK
<results><result><ec><item><ec_number>2.3.2.27</ec_number><protein_count>111</protein_count></item><item><ec_number>2.7.13.3</ec_number><protein_count>11</protein_count></item><item><ec_number>6.2.1.3</ec_number><protein_count>11</protein_count></item><item><ec_number>6.1.1.6</ec_number><protein_count>8</protein_count></item><item><ec_number>6.3.2.13</ec_number><protein_count>8</protein_count></item><item><ec_number>2.7.4.25</ec_number><protein_count>7</protein_count></item><item><ec_number>6.1.1.22</ec_number><protein_count>6</protein_count></item><item><ec_number>3.1.26.-</ec_number><protein_count>4</protein_count></item><item><ec_number>2.3.1.29</ec_number><protein_count>4</protein_count></item><item><ec_number>2.7.1.15</ec_number><protein_count>3</protein_count></item></ec><peptide>AALTER</peptide><total_protein_count>1425</total_protein_count></result><result><peptide>MDGTEYIIVK</peptide><total_protein_count>4</total_protein_count></result></results>
```

### --all / -a

*Request additional information*

By default, the Unipept CLI commands only request basic information from the Unipept server. By using the `--all` flag,
you can request additional information fields such as the lineage of the returned taxa. You can use the `--select`
option to select which fields are included in the output.

::: info Performance penalty
Setting `--all` has a performance penalty inferred from additional database queries. Do not use this parameter unless
the extra information fields are needed.
:::

#### Example

```console
$ unipept pept2ec --all --select peptide,ec_number,*name AALTER
ec_number,ec_name,peptide
2.3.2.27 2.7.13.3 6.2.1.3 6.1.1.6 6.3.2.13 2.7.4.25 6.1.1.22 3.1.26.- 2.3.1.29 2.7.1.15,"RING-type E3 ubiquitin transferase Histidine kinase Long-chain-fatty-acid--CoA ligase Lysine--tRNA ligase UDP-N-acetylmuramoyl-L-alanyl-D-glutamate--2,6-diaminopimelate ligase (d)CMP kinase Asparagine--tRNA ligase Endoribonucleases producing 5'-phosphomonoesters Glycine C-acetyltransferase Ribokinase",AALTER
```

### --host

*Use a different server*

By default, requests go to the Unipept server at `https://api.unipept.ugent.be`. The `--host` option sends them to
another server running the Unipept web service, such as a local instance.

#### Example

```console
$ unipept pept2ec --host http://localhost:3000 AALTER
```

### --quiet / -q

*Suppress service messages*

Suppresses the messages that are normally written to *standard error*, such as retry notices and failed request reports.
Failed requests are still recorded in the log file.

#### Example

```console
$ unipept pept2ec --quiet -i peptides.txt
```

### --log

*Write messages to a log file*

Writes the messages that normally go to *standard error* to the given file instead. Without this option, failed requests
are recorded in a dated file in the `.unipept` directory of your home directory.

#### Example

```console
$ unipept pept2ec --log unipept.log -i peptides.txt
```

### --help / -h

*Display help*

This flag displays the help.


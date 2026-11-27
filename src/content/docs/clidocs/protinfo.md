---
title: unipept protinfo
subtitle: Returns functional and taxonomic information for UniProt accession numbers.
---

The `unipept protinfo` command takes one or more UniProt accession numbers as input and returns the functional
annotations and the taxon of the corresponding UniProt entries. Where [peptinfo](./peptinfo.md) starts from a tryptic
peptide and aggregates over every protein that contains it, protinfo reports on the proteins themselves.

## Input {#input}

The `unipept protinfo` command accepts UniProt accession numbers as command line arguments, from a file passed with the
[--input](#options) option, or from *standard input*. The first of these that is present is used. Files and standard
input should contain a single accession number per line.

#### Example

```console
$ unipept protinfo P78330
$ unipept protinfo --input accessions.txt
$ cat accessions.txt | unipept protinfo
```

## Output {#output}

For each accession number, the command returns the protein name, the taxon it belongs to, and its EC numbers, GO terms
and InterPro entries. Output is CSV by default and contains the following fields:

```console
protein,name,taxon_id,taxon_name,taxon_rank,ec_number,go_term,ipr_code
```

Use the [--select](#options) option to limit the output to the fields you need.

#### Example

```console
$ unipept protinfo --select protein,name,taxon_name,ec_number P78330 Q9UBQ7
protein,name,taxon_name,ec_number
Q9UBQ7,Glyoxylate reductase/hydroxypyruvate reductase,Homo sapiens,1.1.1.79 1.1.1.81
P78330,Phosphoserine phosphatase,Homo sapiens,3.1.3.3
```

::: info Result order
Results are returned in the order the server produces them, which is not necessarily the order of the input. Include the
`protein` field if you need to match each row back to its accession number.
:::

## Command-line options {#options}

### --input / -i

*Read input from a file*

By default, input is read from *standard input*. The `--input` option reads it from a file instead. The option may be
given more than once, in which case the files are read one after the other as a single stream.

#### Example

```console
$ unipept protinfo --input accessions1.txt --input accessions2.txt
```

### --output / -o

*Write output to a file*

By default, output is written to *standard output*. The `--output` option writes it to a file instead. An existing file
is overwritten.

#### Example

```console
$ unipept protinfo --output results.csv P78330
```

### --select / -s

*Specify the output fields*

By default, all information fields received from the Unipept server are returned. The `--select` option controls which
fields are returned. Fields can be given as a comma separated list or by repeating the option, and `*` acts as a
wildcard.

#### Example

```console
$ unipept protinfo --select protein,taxon* P78330
protein,taxon_id,taxon_name,taxon_rank
P78330,9606,Homo sapiens,species
```

### --format / -f

*Specify the output format*

The output format can be set to `csv` (the default), `json` or `xml`.

#### Example

```console
$ unipept protinfo --format json --select protein,taxon_id,taxon_name P78330
[{"protein":"P78330","taxon_id":9606,"taxon_name":"Homo sapiens"}]
```

### --host

*Use a different server*

By default, requests go to the Unipept server at `https://api.unipept.ugent.be`. The `--host` option sends them to
another server running the Unipept web service, such as a local instance.

#### Example

```console
$ unipept protinfo --host http://localhost:3000 P78330
```

### --quiet / -q

*Suppress service messages*

Suppresses the messages that are normally written to *standard error*, such as retry notices and failed request reports.
Failed requests are still recorded in the log file.

### --log

*Write messages to a log file*

Writes the messages that normally go to *standard error* to the given file instead. Without this option, failed requests
are recorded in a dated file in the `.unipept` directory of your home directory.

### --help / -h

*Display help*

This flag displays the help.


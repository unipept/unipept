---
title: unipept taxa2lca
subtitle: Returns the taxonomic lowest common ancestor of a given list of taxon identifiers.
---

The `unipept taxa2lca` command takes one or more NCBI taxon id's as input and returns the taxonomic lowest common
ancestor (LCA) of these taxa as output. All this information is fetched by doing [API-requests](../apidocs/taxa2lca.md)
to the Unipept server.

## Input {#input}

The `unipept taxa2lca` command expects NCBI taxon id's as input. The source of this input can be command line arguments,
a file, or *standard input*. If input is supplied using multiple sources at the same time, the order of priority as
described above is used.

### Command line arguments

If input is supplied using command line arguments, the accession numbers must be separated by spaces.

#### Example

```console
$ unipept taxa2lca 817 329854 1099853
taxon_id,taxon_name,taxon_rank
171549,Bacteroidales,order
```

### File input

Use the [--input parameter](#options) to specify a file to use as input. If input is supplied using a file, a single
taxon per line is expected.

#### Example

```console
$ cat input.txt
817
329854
1099853
$ unipept taxa2lca --input input.txt
taxon_id,taxon_name,taxon_rank
171549,Bacteroidales,order
```

### Standard input

If the command is run without arguments and no file is specified, `unipept taxa2lca` will read its input from *standard
input*. When *standard input* is used, a single taxon per line is expected.

#### Example

```console
$ cat input.txt
817
329854
1099853
$ cat input | unipept taxa2lca
taxon_id,taxon_name,taxon_rank
171549,Bacteroidales,order
```

## Output {#output}

The `unipept taxa2lca` command outputs the taxonomic lowest common ancestor (LCA) for a given set of taxon id's. By
default, the NCBI taxon id, taxon name and taxonomic rank of the LCA are returned. By using the [--all
parameter](#options), this can be supplemented with the full taxonomic lineage of the LCA. Consult the [API
documentation](../apidocs/taxa2lca.md) for a detailed list of output fields. A selection of output fields can be
specified with the [--select parameter](#options). By default, output is generated in csv format. By using the [--format
parameter](#options), the format can be changed into json or xml. The output can be written to a file or to *standard
output*.

### File output

Use the [--output parameter](#options) to specify an output file. If the file aready exists, the output will be appended
to the end of the file.

#### Example

```console
$ unipept taxa2lca --output output.txt 817 329854 1099853
$ cat output.txt
taxon_id,taxon_name,taxon_rank
171549,Bacteroidales,order
```

### Standard output

If no output file is specified, `unipept taxa2lca` will write its output to *standard output*.

#### Example

```console
$ unipept taxa2lca 817 329854 1099853
taxon_id,taxon_name,taxon_rank
171549,Bacteroidales,order
$ unipept taxa2lca 817 329854 1099853 > output.txt
$ cat output.txt
taxon_id,taxon_name,taxon_rank
171549,Bacteroidales,order
```

## Command-line options {#options}

### --input / -i

*Specify an input file*

All Unipept CLI commands can process input from 3 sources: command line arguments, a file, or *standard input*. The
optional `--input` option allows you to specify an input file. The file should contain a single NCBI Taxonomy Identifier
per line. The option may be given more than once, in which case the files are read one after the other as a single
stream.

#### Example

```console
$ cat input.txt
817
329854
1099853
$ unipept taxa2lca --input input.txt
taxon_id,taxon_name,taxon_rank
171549,Bacteroidales,order
```

### --output / -o

*Specify an output file*

By default, the unipept commands write their output to *standard output*. Using the optional `--output` option allows
you to specify a file to write the output to. If the file already exists, it is overwritten; if it doesn't, a new file
will be created.

#### Example

```console
$ unipept taxa2lca --output output.txt 817 329854 1099853
$ cat output.txt
taxon_id,taxon_name,taxon_rank
171549,Bacteroidales,order
```

### --select / -s

*Specify the output fields*

By default, the Unipept CLI commands output all information fields received from the Unipept server. The `--select`
option allows you to control which fields are returned. A list of fields can be specified by a comma-separated list, or
by using multiple `--select` options. A `*` can be used as a wildcard for field names. For example, `--select
peptide,taxon*` will return the peptide field and all fields starting with taxon.

#### Example

```console
$ unipept taxa2lca --select taxon_id,taxon_name 817 329854 1099853
taxon_id,taxon_name
171549,Bacteroidales
$ unipept taxa2lca --select taxon_id --select *rank 817 329854 1099853
taxon_id,taxon_rank
171549,order
```

### --format / -f

*Specify the output format*

By default, the Unipept CLI commands return their output in csv format. The `--format` option allows you to select
another format. Supported formats are csv, json, and xml.

#### Example

```console
$ unipept taxa2lca --format json 817 329854 1099853
[{"taxon_id":171549,"taxon_name":"Bacteroidales","taxon_rank":"order"}]
$ unipept taxa2lca --format xml 817 329854 1099853
<results><result><taxon_id>171549</taxon_id><taxon_name>Bacteroidales</taxon_name><taxon_rank>order</taxon_rank></result></results>
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
$ unipept taxa2lca --all --select taxon_id,phylum* 817 329854 1099853
taxon_id,phylum_id,phylum_name
171549,976,Bacteroidetes
```

### --host

*Use a different server*

By default, requests go to the Unipept server at `https://api.unipept.ugent.be`. The `--host` option sends them to
another server running the Unipept web service, such as a local instance.

#### Example

```console
$ unipept taxa2lca --host http://localhost:3000 817 329854
```

### --quiet / -q

*Suppress service messages*

Suppresses the messages that are normally written to *standard error*, such as retry notices and failed request reports.
Failed requests are still recorded in the log file.

#### Example

```console
$ unipept taxa2lca --quiet -i taxonids.txt
```

### --log

*Write messages to a log file*

Writes the messages that normally go to *standard error* to the given file instead. Without this option, failed requests
are recorded in a dated file in the `.unipept` directory of your home directory.

#### Example

```console
$ unipept taxa2lca --log unipept.log -i taxonids.txt
```

### --help / -h

*Display help*

This flag displays the help.


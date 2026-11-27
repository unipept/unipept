---
title: umgap prot2kmer2lca
subtitle: Maps all k-mers from a FASTA stream of peptides to taxon IDs.
---

The `umgap prot2kmer2lca` command takes one or more peptides as input and outputs the lowest common ancestors of all
their k-mers. It is a combination of the `umgap prot2kmer` and `umgap pept2lca` commands to allow more efficient
parallel computing.

## Usage {#usage}

The input is given in a FASTA format on *standard input*, with a single peptide per FASTA header, which may be
hardwrapped with newlines. All overlapping k-mers in these peptides (k configurable via the `-k` option, and 9 by
default) are searched for in the index (as build by the `umgap buildindex` command) passed as argument. The results are
printed on *standard output* in FASTA format.

```console
$ cat input.fa
>header1
DAIGDVAKAYKKAG*S
$ umgap prot2kmer2lca -k9 uniprot-2020-04-9mer.index < input.fa
>header1
571525
571525
6920
6920
1
6920
```

This command also allows an alternative mode of operation. When memory mapped, it can take some time for the index to be
searched. With the `-m` flag, the complete index will be loaded in memory before operation. This, too, takes some time,
but for a single large analysis, this impact is irrelevant compared to the time of analysis. When processing many short
files, the index would need to be loaded again and again. Instead of using this command as part of a pipeline, `... |
umgap prot2kmer2lca index | ...`, it can run in a separate (and persistent) process, reusing the same loaded index. Run
`umgap prot2kmer2lca -m -s umgap-socket index` as a service, and when the index is loaded, change your original
pipeline(s) to communicate with the socket using [OpenBSD's netcat](http://man.openbsd.org/nc): `... | nc -NU
/path/to/umgap-socket | ...`.

## Command-line options {#options}

### --in-memory / -m

*Load index in memory instead of memory mapping the file contents*

This makes querying significantly faster, but requires some initialization time.

### --one-on-one / -o

*Map unknown sequences to 0 instead of ignoring them*

By default, k-mers not found in the index are ignored.

#### Example

```console
$ cat input.fa
>header1
DAIGDVAKAYKKAG*S
$ umgap prot2kmer2lca -o uniprot-2020-04-9mer.index < input.fa
>header1
571525
571525
6920
6920
1
6920
0
0
```

### --chunksize / -c

*Number of reads grouped into one chunk*

Bigger chunks decrease the overhead caused by multithreading. Because the output order is not necessarily the same as
the input order, having a chunk size which is a multiple of 12 (all 6 translations multiplied by the two paired-end
reads) will keep FASTA records that originate from the same reads together. Takes a value: `--chunksize <c>`. The
default is `240`.

### --length / -k

*The length of the k-mers in the index*

Takes a value: `--length <k>`. The default is `9`.

### --socket / -s

*Instead of reading from stdin and writing to stdout, create a Unix socket to communicate with using OpenBSD's netcat
(nc -NU socket)*

This is especially useful in combination with the `--in-memory` flag: you only have to load the index in memory once,
after which you can query it without having the loading time overhead each time. Takes a value: `--socket <s>`.

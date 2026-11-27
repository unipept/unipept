---
title: umgap splitkmers
subtitle: Splits a TSV stream of peptides and taxon IDs into k-mers and taxon IDs
---

The `umgap splitkmers` command takes tab-separated taxon IDs and protein sequences and outputs the k-mers mapped to the
taxon IDs.

## Usage {#usage}

The input is given on *standard input* and should be a TSV formatted stream of taxon IDs and a protein sequence from
this taxon. The output will be written to *standard output* and consists of a TSV formatted stream of k-mers mapped to
the taxa in which they occur. The k-mer length is configurable with the `-k` option, and is 9 by default.

This output stream is ready to be grouped by K-mer by sorting and then aggregated into a searchable index, with the
`sort`, `umgap joinkmers` and `umgap buildindex` commands.

```console
$ cat input.tsv
654924	MNAKYDTDQGVGRMLFLGTIGLAVVVGGLMAYGYYYDGKTPSSGTSFHTASPSFSSRYRY
176652	MIKLFCVLAAFISINSACQSSHQQREEFTVATYHSSSICTTYCYSNCVVASQHKGLNVESYTCDKPDPYGRETVCKCTLIKCHDI
$ umgap splitkmers < input.tsv
MNAKYDTDQ	654924
NAKYDTDQG	654924
AKYDTDQGV	654924
KYDTDQGVG	654924
YDTDQGVGR	654924
...
SPSFSSRYR	654924
PSFSSRYRY	654924
MIKLFCVLA	176652
IKLFCVLAA	176652
KLFCVLAAF	176652
...
```

## Command-line options {#options}

### --length / -k

*The k-mer length*

Takes a value: `--length <k>`. The default is `9`.

#### Example

```console
$ cat short.tsv
654924	MNAKYDTDQGVGR
176652	MIKLFCVLAA
$ umgap splitkmers -k 6 < short.tsv
MNAKYD	654924
NAKYDT	654924
AKYDTD	654924
KYDTDQ	654924
YDTDQG	654924
DTDQGV	654924
TDQGVG	654924
DQGVGR	654924
MIKLFC	176652
IKLFCV	176652
KLFCVL	176652
LFCVLA	176652
FCVLAA	176652
```

### --prefix / -p

*Print only the (k-1)-mer suffixes of the k-mers starting with this character*

Takes a value: `--prefix <p>`.

#### Example

```console
$ cat short.tsv
654924	MNAKYDTDQGVGR
176652	MIKLFCVLAA
$ umgap splitkmers -k 6 -p M < short.tsv
NAKYD	654924
IKLFC	176652
```

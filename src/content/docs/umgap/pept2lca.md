---
title: umgap pept2lca
subtitle: Maps a FASTA stream of peptides to taxon IDs.
---

The `umgap pept2lca` command takes one or more amino acid sequences and looks up the corresponding taxon ID in an index
file (as build by the `umgap buildindex` command).

## Usage {#usage}

The input is given in FASTA format on *standard input*. Per FASTA header, there can be multiple sequences, each on a
line. In the following example we match tryptic peptides on their lowest common ancestor in the NCBI taxonomy.

```console
$ cat input.fa
>header1
AAALTER
ENFVYLAK
$ umgap pept2lca tryptic-peptides.index < input.fa
>header1
2
3398
```

By default, sequences not found in the index are ignored. Using the `-o (--on-on-one)` flag, they are mapped to 0,
instead.

```console
$ cat input.fa
>header1
NOTATRYPTICPEPTIDE
ENFVYLAK
$ umgap pept2lca -o tryptic-peptides.index < input.fa
>header1
0
3398
```

| Option | Description |
| ------ | ----------- |
| **-h / --help** | Prints help information |
| **-V / --version** | Prints version information |
| **-m / --in-memory** | Load index in memory instead of memory mapping the file contents. This makes querying significantly faster, but requires some initialization time. |
| **-o / --one-on-one** | Map unknown sequences to 0 instead of ignoring them |
| **-c / --chunksize c** | Number of reads grouped into one chunk. Bigger chunks decrease the overhead caused by multithreading. Because the output order is not necessarily the same as the input order, having a chunk size which is a multiple of 12 (all 6 translations multiplied by the two paired-end reads) will keep FASTA records that originate from the same reads together [default: 240] |


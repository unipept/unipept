---
title: umgap joinkmers
subtitle: Aggregates a TSV stream of peptides and taxon IDs
---

The `umgap joinkmers` command takes tab-separated peptides and taxon IDs, aggregates the taxon IDs where consecutive
peptides are equal and outputs a tab-separated triple of peptide, consensus taxon ID and taxon rank.

## Usage {#usage}

The input is given on *standard input*. If it is sorted on the first column, a complete mapping from strings to
aggregated taxa and its rank will be written to *standard output*. It is meant to be used after the `umgap splitkmers`
and `sort` commands, and it's output is ideal for `umgap buildindex`, but there may be further uses.

The aggregation strategy used in this command to find a consensus taxon is the hybrid approach of the `umgap taxa2agg`
command, with a 95% factor. This keeps the result close to the lowest common ancestor, but filters out some outlying
taxa.

The taxonomy to be used is passed as an argument to this command. This is a preprocessed version of the NCBI taxonomy.

```console
$ cat input.tsv
AAAAA	34924
AAAAA	30423
AAAAA	5678
BBBBBB	48890
BBBBBB	156563
$ umgap joinkmers taxons.tsv < input.tsv
AAAAA	2759	superkingdom
BBBBBB	9153	family
```

| Option | Description |
| ------ | ----------- |
| **-h / --help** | Prints help information |
| **-V / --version** | Prints version information |


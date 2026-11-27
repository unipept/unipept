---
title: umgap taxa2agg
subtitle: Aggregates taxon IDs in a FASTA stream
---

The `umgap taxa2agg` command takes one or more lists of taxon IDs as input and aggregates them into a single consensus
taxon.

## usage {#usage}

The input is given in a FASTA format on *standard input*. Each FASTA record contains a list of taxon IDs, separated by
newlines. The output is written to *standard output*, also in a FASTA format, each record containing a single taxon ID,
which is the consensus taxon resulting from aggregation of the given list.

The taxonomy to be used is passed as an argument to this command. This is a preprocessed version of the NCBI taxonomy.

```console
$ cat input.fa
>header1
571525
571525
6920
6920
1
6920
$ umgap taxa2agg taxons.tsv < input.fa
>header1
571525
```

By default, the aggregation used is the maximum root-to-leaf path (MRTL). A variant of the lowest common ancestor (LCA*)
aggregation is also available via the `-a` and `-m` options, as is a hybrid approach.

- **-m rmq -a mrtl** is the default aggregation strategy. It selects the taxon from the given list which has the highest
  frequency of ancestors in the list (including its own frequency). A range-minimum-query (RMQ) algorithm is used.

- **-m tree -a lca\*** returns the taxon (possibly not from the list) of lowest rank without contradicting taxa in the
  list. Non-contradicting taxa of a taxon are either itself, its ancestors and its descendants. A tree-based algorithm
  is used.

- **-m tree -a hybrid** mixes the above two strategies, which results in a taxon which might have not have the highest
  frequency of ancestors in the list, but would have less contradicting taxa. Use the `-f` option to select a hybrid
  close to the `MRTL(-f 0.0)` or to the `LCA (-f 1.0)`.

| Option | Description |
| ------ | ----------- |
| **-h / --help** | Prints help information |
| **-V / --version** | Prints version information |
| **-r / --ranked** | Let all taxa snap to taxa with a named rank (such as species) during calculations |
| **-s / --scored** | Each taxon is followed by a score between 0 and 1 |
| **-f / --factor f** | The factor for the hybrid aggregation, from 0.0 (MRTL) to 1.0 (LCA*) [default: 0.25] |
| **-l / --lower-bound l** | The smallest input frequency for a taxon to be included in the aggregation [default: 0] |
| **-m / --method m** | The method to use for aggregation [default: tree] [possible values: tree, rmq] |
| **-a / --aggregate a** | The strategy to use for aggregation [default: hybrid] [possible values: lca*, hybrid, mrtl] |


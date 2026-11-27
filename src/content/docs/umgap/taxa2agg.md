---
title: umgap taxa2agg
subtitle: Aggregates taxon IDs in a FASTA stream
---

The `umgap taxa2agg` command takes one or more lists of taxon IDs as input and aggregates them into a single consensus
taxon.

## Usage {#usage}

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

## Command-line options {#options}

### --ranked / -r

*Let all taxa snap to taxa with a named rank (such as species) during calculations*

### --scored / -s

*Each taxon is followed by a score between 0 and 1*

### --factor / -f

*The factor for the hybrid aggregation, from 0.0 (MRTL) to 1.0 (LCA*)*

Takes a value: `--factor <f>`. The default is `0.25`.

### --lower-bound / -l

*The smallest input frequency for a taxon to be included in the aggregation*

Takes a value: `--lower-bound <l>`. The default is `0`.

### --method / -m

*The method to use for aggregation*

Takes a value: `--method <m>`. The default is `tree] [possible values: tree, rmq`.

### --aggregate / -a

*The strategy to use for aggregation*

Takes a value: `--aggregate <a>`. The default is `hybrid] [possible values: lca*, hybrid, mrtl`.

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

In the example, 2593676 (unclassified Streptomyces) has no named rank. With `-r`, it counts as its genus
Streptomyces (1883).

#### Example

```console
$ cat ranked.fa
>header1
2593676
2593676
1883
$ umgap taxa2agg taxons.tsv < ranked.fa
>header1
2593676
$ umgap taxa2agg -r taxons.tsv < ranked.fa
>header1
1883
```

### --scored / -s

*Each taxon is followed by a score between 0 and 1*

#### Example

```console
$ cat scored.fa
>header1
1883=0.9
1883=0.8
1598=0.2
1239=0.3
1239=0.1
$ umgap taxa2agg -s taxons.tsv < scored.fa
>header1
1883
```

### --factor / -f

*The factor for the hybrid aggregation, from 0.0 (MRTL) to 1.0 (LCA\*)*

Takes a value: `--factor <f>`. The default is `0.25`.

In the example, 1883 is Streptomyces, 1598 is *Limosilactobacillus reuteri* and 1239 is Bacillota. With `-f 1`, the
result is 1783272 (Bacillati), the lowest taxon that contradicts none of them.

#### Example

```console
$ cat mix.fa
>header1
1883
1883
1598
1239
1239
$ umgap taxa2agg taxons.tsv < mix.fa
>header1
1598
$ umgap taxa2agg -f 1 taxons.tsv < mix.fa
>header1
1783272
```

### --lower-bound / -l

*The smallest input frequency for a taxon to be included in the aggregation*

Takes a value: `--lower-bound <l>`. The default is `0`.

In the example, 1239 is Bacillota and 1598 is *Limosilactobacillus reuteri*, a species in Bacillota. With `-l 2`, the
taxa that occur only once (1598) are left out.

#### Example

```console
$ cat lower.fa
>header1
1239
1239
1598
$ umgap taxa2agg taxons.tsv < lower.fa
>header1
1598
$ umgap taxa2agg -l 2 taxons.tsv < lower.fa
>header1
1239
```

### --method / -m

*The method to use for aggregation*

Takes a value: `--method <m>`, one of `tree` and `rmq`. The default is `tree`.

### --aggregate / -a

*The strategy to use for aggregation*

Takes a value: `--aggregate <a>`, one of `lca*`, `hybrid` and `mrtl`. The default is `hybrid`.

With `-a 'lca*'`, the result for the input of the `--factor` example is 1783272 (Bacillati).

#### Example

```console
$ cat mix.fa
>header1
1883
1883
1598
1239
1239
$ umgap taxa2agg -a 'lca*' taxons.tsv < mix.fa
>header1
1783272
```

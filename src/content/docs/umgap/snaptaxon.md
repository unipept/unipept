---
title: umgap snaptaxon
subtitle: Snaps taxon IDs to a rank or specified taxa
---

The `umgap snaptaxon` command takes one or more taxon IDs. For each taxon, it searches amongst its ancestors if any are
of the specified rank (e.g., `-r species`), or are one of the listed taxa (e.g., `-t 1598 -t 1883`). If so, the taxon is
replaced by the most specific of these matching taxa. Otherwise, it is mapped to the root of the taxonomy.

## Usage {#usage}

The input is given on *standard input* and may be any sequence of FASTA headers and/or lines containing a single taxon
ID. The FASTA headers (if any) are just copied over to *standard output*.

The taxonomy to be used is passed as an argument to this command. This is a preprocessed version of the NCBI taxonomy.

```console
$ cat input.fa
>header1
888268
186802
1598
1883
$ umgap snaptaxon taxons.tsv -r order < input.fa
>header1
38820
186802
186826
85011
```

## Command-line options {#options}

### --invalid / -i

*Include the invalidated taxa from the taxonomy*

In the example, 60 (Vitreoscilla sp.) is an invalid taxon. Without `-i`, it snaps to the root (1).

#### Example

```console
$ cat invalid.fa
>header1
60
$ umgap snaptaxon -r species taxons.tsv < invalid.fa
>header1
1
$ umgap snaptaxon -i -r species taxons.tsv < invalid.fa
>header1
60
```

### --rank / -r

*The rank to snap towards [possible values: superkingdom, kingdom, subkingdom, superphylum, phylum, subphylum,
superclass, class, subclass, infraclass, superorder, order, suborder, infraorder, parvorder, superfamily, family,
subfamily, tribe, subtribe, genus, subgenus, species group, species subgroup, species, subspecies, varietas, forma]*

Takes a value: `--rank <r>`.

#### Example

```console
$ cat input.fa
>header1
888268
186802
1598
1883
$ umgap snaptaxon taxons.tsv -r order < input.fa
>header1
38820
186802
186826
85011
```

### --taxons / -t

*A taxon to snap towards (allow multiple times)*

Takes one or more values: `--taxons <t>...`.

#### Example

```console
$ cat input.fa
>header1
888268
186802
1598
1883
$ umgap snaptaxon taxons.tsv -t 1239 2 < input.fa
>header1
1
1239
1239
2
```

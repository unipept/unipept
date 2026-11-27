---
title: umgap seedextend
subtitle: Selects promising regions in sequences of taxon IDs
---

The `umgap seedextend` command takes one or more sequences of taxon IDs and selects regions of consecutive predictions.
It can be used to filter out accidental matches of incorrect taxa.

## Usage {#usage}

The input is given in a FASTA format on *standard input*. It should consist of taxon IDs separated by newlines, and the
order of these taxa should reflect their location on a peptide, such as output by the `umgap prot2kmer2lca -o` command.
As such, 3 consecutive equal IDs representing 9-mers, for instance, indicate a 11-mer match. This so-called seed could
still be extended with other taxa, forming an extended seed. The command writes all taxa in any of these extended seeds
to `standard output`.

```console
$ cat dna.fa
>header1
CGCAGAGACGGGTAGAACCTCAGTAATCCGAAAAGCCGGGATCGACCGCCCCTTGCTTGCAGCCGGGCACTACAGGACCC
$ umgap translate -n -a < dna.fa | umgap prot2kmer2lca 9mer.index > input.fa
>header1|1
9606 9606 2759 9606 9606 9606 9606 9606 9606 9606 8287
>header1|2
2026807 888268 186802 1598 1883
>header1|3
1883
>header1|1R
27342 2759 155619 1133106 38033 2
>header1|2R
>header1|3R
2951
$ umgap seedextend < input.fa
>header1|1
9606 9606 2759 9606 9606 9606 9606 9606 9606 9606 8287
>header1|2
>header1|3
>header1|1R
>header1|2R
>header1|3R
```

Taxon IDs are separated by newlines in the actual output, but are separated by spaces in this example.

The number of consecutive equal IDs to start a seed is 2 by default, and can be changed using the `-s` option. The
maximum length of gaps between seeds to join in an extension can be set with `-g`, no gaps are allowed by default.

The command can be altered to print only the extended seed with the highest score among all extended seeds. Pass a
taxonomy using the `-r taxon.tsv` option to activate this. In this scored mode, extended seeds with gaps are given a
penalty of 5, which can be made more or less severe (higher or lower) with the `-p` option.

## Command-line options {#options}

### --max-gap-size / -g

*The maximum length of a gap between seeds in an extension*

Takes a value: `--max-gap-size <g>`. The default is `0`.

### --min-seed-size / -s

*The minimum length of equal taxa to count as seed*

Takes a value: `--min-seed-size <s>`. The default is `2`.

### --penalty / -p

*The score penalty for gaps in extended seeds*

Takes a value: `--penalty <p>`. The default is `5`.

### --ranked / -r

*Use taxon ranks in given NCBI taxonomy tsv-file to pick extended seed with highest score*

Takes a value: `--ranked <r>`.

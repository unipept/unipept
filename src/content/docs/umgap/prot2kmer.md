---
title: umgap prot2kmer
subtitle: Splits a FASTA stream of peptides into k-mers
---

The `umgap prot2kmer` command takes one or more peptides as input and outputs all their k-length subsequences in order
of appearance.

## Usage {#usage}

The input is given in a FASTA format on *standard input* with a single peptide per FASTA header, which may be
hardwrapped with newlines. All overlapping k-mers of a peptide are written to standard output, separated by newlines.
The k-mer length is configurable with the `-k` option, and is 9 by default.

```console
$ cat input.fa
>header1
DAIGDVAKAYKKAG*S
$ umgap prot2kmer < input.fa
>header1
DAIGDVAKA
AIGDVAKAY
IGDVAKAYK
GDVAKAYKK
DVAKAYKKA
VAKAYKKAG
AKAYKKAG*
KAYKKAG*S
```

| Option | Description |
| ------ | ----------- |
| **-h / --help** | Prints help information |
| **-V / --version** | Prints version information |
| **-k / --length k** | The k-mer length [default: 9] |


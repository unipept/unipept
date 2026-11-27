---
title: umgap prot2tryp2lca
subtitle: Digests a FASTA stream of peptides and maps all tryptic peptides to taxon IDs.
---

The `umgap prot2tryp2lca` command takes one or more peptides and splits these into tryptic peptides, possibly filters
them, and outputs their lowest common ancestors. It is a combination of the `umgap prot2tryp`, `umgap filter` and `umgap
pept2lca` commands to allow more efficient parallel computing (c.f. their documentation for details).

## Usage {#usage}

The input is given in a FASTA format on *standard input* with a single peptide per FASTA header, which may be
hardwrapped with newlines. The command prints the lowest common ancestors for each tryptic peptide found in each given
peptide to *standard output*.

```console
$ cat input.fa
>header1
AYKKAGVSGHVWQSDGITNCLLRGLTRVKEAVANRDSGNGYINKVYYWTVDKRATTRDALDAGVDGIMTNYPDVITDVLN
$ umgap prot2tryp2lca tryptic-lca.index < input.fa
>header1
571525
1
571525
6920
```

| Option | Description |
| ------ | ----------- |
| **-h / --help** | Prints help information |
| **-V / --version** | Prints version information |
| **-m / --in-memory** | Load index in memory instead of memory mapping the file contents. This makes querying significantly faster, but requires some initialization time. |
| **-o / --one-on-one** | Map unknown sequences to 0 instead of ignoring them |
| **-c / --chunksize c** | Number of reads grouped into one chunk. Bigger chunks decrease the overhead caused by multithreading. Because the output order is not necessarily the same as the input order, having a chunk size which is a multiple of 12 (all 6 translations multiplied by the two paired-end reads) will keep FASTA records that originate from the same reads together [default: 240] |
| **-k / --keep k** | Amino acid symbols that a sequence must contain [none by default] |
| **-d / --drop d** | Amino acid symbols that a sequence may not contain [none by default] |
| **-L / --maxlen L** | Maximum length allowed [default: 50] |
| **-l / --minlen l** | Minimum length required [default: 5] |
| **-p / --pattern p** | The cleavage-pattern (regex), i.e. the pattern after which the next peptide will be cleaved for tryptic peptides) [default: ([KR])([^P])] |


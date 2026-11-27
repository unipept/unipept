---
title: umgap filter
subtitle: Filters a FASTA stream of peptides
---

The `umgap filter` command takes a FASTA stream of peptides as input and outputs a filtered stream.

## Usage {#usage}

The input is given in FASTA format on *standard input*. Per FASTA header, there may be multiple peptides separated by
newlines. Each of these peptides are checked against the filter criteria and written to *standard output* they pass
them. The criteria are specified as options:

- **-m** 5 sets the minimum length of the peptides to 5.
- **-M** 50 sets the maximum length of the peptides to 50.
- **-c** LIK requires the peptides to contain amino acids Leucine (L), Isoleucine (I) and Lysine (K).
- **-l** LIK removes the peptides containing the amino acids Leucine, Isoleucine or Lysine.

```console
$ cat input.fa
>header1
AYKKAGVSGHVWQSDGITNCLLRGLTRVKEAVANRDSGNGYINKVYYWTVDKRATTRDALDAGVDGIMTNYPDVITDVLN
AYK
K
AGVSGHVWQSDGITNCLLR
GLTR
VK
EAVANR
DSGNGYINK
$ umgap filter < input.fa
>header1
AGVSGHVWQSDGITNCLLR
EAVANR
DSGNGYINK
$ umgap filter -m 0 -c R -l K < input.fa
>header1
AGVSGHVWQSDGITNCLLR
GLTR
EAVANR
```

## Command-line options {#options}

### --contains / -c

*Amino acid symbols that a sequence must contain*

Takes a value: `--contains <c>`. There is no default.

### --lacks / -l

*Amino acid symbols that a sequence may not contain*

Takes a value: `--lacks <l>`. There is no default.

### --maxlen / -M

*Maximum length allowed*

Takes a value: `--maxlen <M>`. The default is `50`.

### --minlen / -m

*Minimum length required*

Takes a value: `--minlen <m>`. The default is `5`.

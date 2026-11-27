---
title: umgap prot2tryp
subtitle: Splits a FASTA stream into tryptic peptides
---

The `umgap prot2tryp` command takes one or more amino acid sequences as input and applies an *in silico* peptide digest.

## Usage {#usage}

The input is given in a FASTA format on *standard input* with a single peptide per FASTA header, which may be
hardwrapped with newlines. The peptides resulting from the digest are written in FASTA format to *standard output*, with
multiple peptides per FASTA header, separated by newlines.

```console
$ cat input.fa
>header1
AYKKAGVSGHVWQSDGITNCLLRGLTRVKEAVANRDSGNGYINKVYYWTVDKRATTRDALDAGVDGIMTNYPDVITDVLN
$ umgap prot2tryp tryptic-lca.index < input.fa
>header1
AYK
K
AGVSGHVWQSDGITNCLLR
GLTR
VK
EAVANR
DSGNGYINK
VYYWTVDK
R
ATTR
DALDAGVDGIMTNYPDVITDVLN
```

Using the `-p` flag, you can change the splitting pattern. The default pattern (`[KR])([^P]`) splits between any Lysine
(K) or Arginine (R), followed by any amino acid that is not Proline (P).

## Command-line options {#options}

### --pattern / -p

*The cleavage-pattern (regex), i.e. the pattern after which the next peptide will be cleaved for tryptic peptides*

Takes a value: `--pattern <p>`. The default is `([KR])([^P])`.

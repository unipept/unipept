---
title: umgap filter
subtitle: Filters a FASTA stream of peptides
---

The `umgap filter` command takes a FASTA stream of peptides as input and outputs a filtered stream.

## Usage {#usage}

The input is given in FASTA format on *standard input*. Per FASTA header, there may be multiple peptides separated by
newlines. Each of these peptides are checked against the filter criteria and written to *standard output* they pass
them. The criteria are set with the options below.

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
```

## Command-line options {#options}

### --contains / -c

*Amino acid symbols that a sequence must contain*

Takes a value: `--contains <c>`. There is no default.

For example, `-c LIK` keeps only the peptides that contain leucine (L), isoleucine (I) and lysine (K).

#### Example

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
$ umgap filter -c GR < input.fa
>header1
AGVSGHVWQSDGITNCLLR
```

### --lacks / -l

*Amino acid symbols that a sequence may not contain*

Takes a value: `--lacks <l>`. There is no default.

For example, `-l LIK` removes the peptides that contain leucine (L), isoleucine (I) or lysine (K).

#### Example

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
$ umgap filter -l R < input.fa
>header1
DSGNGYINK
```

### --maxlen / -M

*Maximum length allowed*

Takes a value: `--maxlen <M>`. The default is `50`.

#### Example

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
$ umgap filter -M 8 < input.fa
>header1
EAVANR
```

### --minlen / -m

*Minimum length required*

Takes a value: `--minlen <m>`. The default is `5`.

#### Example

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
$ umgap filter -m 3 < input.fa
>header1
AYK
AGVSGHVWQSDGITNCLLR
GLTR
EAVANR
DSGNGYINK
```

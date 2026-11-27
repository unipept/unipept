---
title: umgap buildindex
subtitle: Builds an index mapping short strings to taxon IDs
---

The `umgap buildindex` command takes tab-separated strings and taxon IDs, and creates a finite state transducer (FST) of
this mapping.

## Usage {#usage}

The input is given on *standard input*. It should be in a TSV format with two columns, ordered by the first. The unique
strings in the first column should be mapped to the integers (taxon IDs) in the second column. A binary file with a
compressed mapping is written to *standard output*.

```console
$ cat input.tsv
AAAAA	2759
BBBBBB	9153
$ umgap buildindex < input.tsv > tiny.index
$ umgap printindex tiny.index
AAAAA	2759
BBBBBB	9153
```

| Option | Description |
| ------ | ----------- |
| **-h / --help** | Prints help information |
| **-V / --version** | Prints version information |


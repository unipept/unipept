---
title: umgap taxa2freq
subtitle: Counts ranked taxon occurrences in a stream of taxon IDs or arguments
---

The `umgap taxa2freq` command creates a frequency table of a list of taxa on a given target rank (species by default).
When invoked with file arguments, it adds a column for each file.

## usage {#usage}

The input is given on *standard input*, or in multiple file arguments, a single taxon ID on each line. Each taxon that
is more specific than the target rank is counted towards its ancestor on the target rank. Each taxon less specific than
the target rank is counted towards root. The command outputs a CSV table of counts, taxon IDs and their names.

The taxonomy to be used is passed as an argument to this command. This is a preprocessed version of the NCBI taxonomy.

```console
$ cat input.txt
9606
9606
2759
9606
9606
9606
9606
9606
9606
9606
8287
$ umgap taxa2freq taxons.tsv < input.txt
taxon id,taxon name,stdin
1,root,2
9606,Homo sapiens,9
$ umgap taxa2freq taxons.tsv input.txt input.txt
taxon id,taxon name,input.txt,input.txt
1,root,2,2
9606,Homo sapiens,9,9
```

With the `-r` option, the default species rank can be set to any named rank.

```console
$ umgap taxa2freq -r phylum taxons.tsv < input.txt
taxon id,taxon name,stdin
7711,Chordata,10
```

| Option | Description |
| ------ | ----------- |
| **-h / --help** | Prints help information |
| **-V / --version** | Prints version information |
| **-f / --frequency f** | The minimum frequency to be reported [default: 1] |
| **-r / --rank r** | The rank to show [default: species] |


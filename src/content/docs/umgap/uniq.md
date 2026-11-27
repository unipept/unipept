---
title: umgap uniq
subtitle: Joins consecutive FASTA records with the same header
---

The `umgap uniq` command can be used to join together the predictions of 2 paired ends before aggregation.

## Usage {#usage}

The input is given in a FASTA format on *standard input*. The content of all consecutive records with the same FASTA
header is joined under a single header, separated by newlines (or another separated set with `-s`).

A delimiter can be passed with the `-d` option to drop this delimiter and everything after it from the FASTA header
before comparing it.

```console
$ cat input.fa
>header1/1
147206
240495
>header1/2
1883
1
1883
1883
$ umgap uniq -d / < input.fa
>header1
147206
240495
1883
1
1883
1883
```

Taxon IDs are separated by newlines in the actual output, but are separated by spaces in this example.

## Command-line options {#options}

### --wrap / -w

*Wrap the output sequences*

#### Example

```console
$ { echo '>header1'; seq 30; } | umgap uniq -s , -w
>header1
1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,2
7,28,29,30
```

### --separator / -s

*Separator between output items*

Takes a value: `--separator <s>`. The default is `newline`.

#### Example

```console
$ cat uniq.fa
>header1/1
147206
240495
>header1/2
1883
1
1883
1883
$ umgap uniq -d / -s , < uniq.fa
>header1
147206,240495,1883,1,1883,1883
```

### --delimiter / -d

*Strip FASTA headers after this string*

Takes a value: `--delimiter <d>`.

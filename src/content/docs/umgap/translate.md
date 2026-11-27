---
title: umgap translate
subtitle: Translates a FASTA stream of DNA reads to peptides
---

The `umgap translate` command takes one or more DNA sequences and translates them into amino acid sequences

## Usage {#usage}

The DNA sequences are expected in a FASTA format on *standard input*.

```console
$ cat input.fa
>header1
GATTACAAA
$ umgap translate -f1 < input.fa
>header1
DYK
```

## Command-line options {#options}

### --all-frames / -a

*Read and output all six frames*

#### Example

```console
$ cat input.fa
>header1
GATTACAAA
$ umgap translate -a < input.fa
>header1
DYK
>header1
IT
>header1
LQ
>header1
FVI
>header1
L*
>header1
CN
```

### --append-name / -n

*Append a bar (\|) and the name of the frame to the fasta header*

#### Example

```console
$ cat input.fa
>header1
GATTACAAA
$ umgap translate -a -n < input.fa
>header1|1
DYK
>header1|2
IT
>header1|3
LQ
>header1|1R
FVI
>header1|2R
L*
>header1|3R
CN
```

### --methionine / -m

*Replace each start-codon with methionine*

#### Example

```console
$ cat start.fa
>header1
TTGGATTACAAA
$ umgap translate -f1 < start.fa
>header1
LDYK
$ umgap translate -f1 -m < start.fa
>header1
MDYK
```

### --show-table / -s

*Instead of normal use, print the selected table and exit*

#### Example

```console
$ umgap translate -s
universal=1
AAs    = FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG
Starts = ---M---------------M---------------M----------------------------
Base1  = TTTTTTTTTTTTTTTTCCCCCCCCCCCCCCCCAAAAAAAAAAAAAAAAGGGGGGGGGGGGGGGG
Base2  = TTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGGTTTTCCCCAAAAGGGG
Base3  = TCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAGTCAG
```

### --frame / -f

*Adds a reading frame (1, 2, 3, 1R, 2R or 3R)*

Takes one or more values: `--frame <f>...`.

Pass `-f` once for each frame to translate. To keep the frames apart, add `-n`, which adds the name of the frame
to the FASTA header.

#### Example

```console
$ cat input.fa
>header1
GATTACAAA
$ umgap translate -n -f1 -f1R < input.fa
>header1|1
DYK
>header1|1R
FVI
```

### --table / -t

*Translation table to use*

Takes a value: `--table <t>`. The default is `1`.

For instance, `-t11` selects the bacterial, archaeal and plant plastid code. Translation table 4 translates `TGA` to
tryptophan (`W`) instead of a stop codon.

#### Example

```console
$ cat stop.fa
>header1
TGAGATTAC
$ umgap translate -f1 < stop.fa
>header1
*DY
$ umgap translate -f1 -t 4 < stop.fa
>header1
WDY
```

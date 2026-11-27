---
title: prot2pept
subtitle: Splits proteins into peptides based on (trypsin) digest.
---

The `prot2pept` command takes one or more protein sequences as input, performs an in silico tryptic digest on them and
returns the digested peptides as output. By default, a trypsin digest is simulated, but other proteases can be specified
by using the [--patern parameter](#options). This command runs entirely locally and doesn't connect to any server.

## Input {#input}

The `prot2pept` command expects protein sequences as input via *standard input*. A single protein sequences per line is
expected.

#### Example

```console
$ cat input.txt
AALTERAALE
MDGTEKYIIVK
$ cat input | prot2pept
AALTER
AALE
MDGTEK
YIIVK
```

## Output {#output}

The `prot2pept` command supports input in fasta format. This format consists of a fasta header (a line starting with a
>), followed by one or more lines containing the protein sequence. When this format is detected, the command behaves
slightly different. The main difference is that newlines between fasta headers are ignored: all lines between fasta
headers are treated as a single protein. Next to this, the fasta headers are also written to output.

## Fasta support {#fasta}

The `prot2pept` command outputs the split peptides to *standard output*. All peptides are separated by newlines.

#### Example

```console
$ cat input.txt
AALTE
AALRTER
$ cat input.txt | prot2pept
AALTE
AALR
TER
$ cat input.txt
> fasta header
AALTE
AALRTER
> other header
PEPTIDE
$ cat input.txt | prot2pept
> fasta header
AALTEAALR
TER
> other header
PEPTIDE
```

## Command-line options {#options}

### --pattern / -p

*Specify cleavage pattern*

By default, proteins are split by simulating a trypsin digest. This corresponds by splitting the input string by using
the regular expression `([KR])([^P])`. The `--pattern` option allows you to specify an alternative regular expression to
split the sequences. Patterns use JavaScript regular expression syntax.

#### Example

```console
$ echo "LGAARPLGAGLAKVIGAGIGIGK" | prot2pept
LGAARPLGAGLAK
VIGAGIGIGK
$ echo "LGAARPLGAGLAKVIGAGIGIGK" | prot2pept --pattern '([KR])([^V])'
LGAAR
PLGAGLAKVIGAGIGIGK
```

### --input / -i

*Read input from a file*

By default, input is read from *standard input*. The `--input` option reads it from a file instead. The option may be
given more than once, in which case the files are read one after the other as a single stream.

#### Example

```console
$ prot2pept --input proteins1.txt --input proteins2.txt
```

### --output / -o

*Write output to a file*

By default, output is written to *standard output*. The `--output` option writes it to a file instead. An existing file
is overwritten.

#### Example

```console
$ prot2pept --output results.txt
```

### --version / -V

*Display the version*

Prints the version of the Unipept CLI and exits.

### --help / -h

*Display help*

This flag displays the help.


---
title: umgap taxa2tree
subtitle: Visualizes a stream of taxon IDs using the Unipept API
---

The `umgap taxa2tree` command, similar to the `unipept taxa2tree` command, takes one or more taxon IDs as input and
returns a visualized taxonomic tree of these taxa using the [Unipept API server](../apidocs/taxa2tree.md).

## Usage {#usage}

The input is given in a FASTA format on *standard input*. Each FASTA record contains one taxon ID. A HTML file is
written to *standard output* containing a visualization of the taxonomic tree containing all these taxa.

```console
$ cat input.txt
>header1
817
329854
1099853
$ umgap taxa2tree < input.txt > output.html
```

## Command-line options {#options}

### --url / -u

*Host the result online and return the URL*

With `-u`, a URL to the visualization hosted online is printed instead of the HTML file.

#### Example

```console
$ cat input.txt
>header1
817
329854
1099853
$ umgap taxa2tree --url < input.txt
https://bl.ocks.org/a686a37e1dcd43dd4ec7d467487bd6a1
```

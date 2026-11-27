---
title: UMGAP documentation
subtitle: Use the Unipept MetaGenomics Analysis Pipeline to assign taxonomic labels to your shotgun metagenomics reads. The results are available as taxonomic frequency tables and interactive visualizations.
menuLabel: Overview
---

::: info Getting started with UMGAP
Go from a paired-end FASTQ sample to an interactive visualisation in 7 simple commands.

```console
$ git clone https://github.com/unipept/umgap.git && cd umgap # download source code
$ cargo install --path . # install UMGAP
$ git clone https://github.com/unipept/FragGeneScanPlusPlus.git FGSpp # download gene predictor
$ cd FGSpp && make && cd .. # install gene predictor
$ ./scripts/umgap-setup.sh -f FGSpp # interactive setup
$ ./scripts/umgap-analyse.sh -1 A1.fq -2 A2.fq -t tryptic-precision -o results.fa # run analysis
$ ./scripts/umgap-visualize.sh -i results.fa -u # get interactive results
```
:::

The UMGAP is a collection of command line tools. Combine them into your own pipeline to identify (short) shotgun
metagenomics reads guided by our [case studies](./casestudies/index.md), or use one of the preconfigured pipelines.
After each read is assigned a taxon, collect the results in frequency tabels and interactive visualizations. With
communication via *standard input* and *standard output*, and an easy to understand, consistent intermediate format,
it's easy to plug your own extensions into the pipeline.

- **UMGAP High Precision**: Optimized for high precision identifications on your metagenomics reads.
- **UMGAP Max Precision**: Optimized for highest precision, with a small setback on sensitivity.
- **UMGAP Tryptic Precision**: Made for fast analyses on your laptop. Fewer results, but accurate.
- **UMGAP High Sensitivity**: Optimized for high sensitivity identifications on metagenomics reads.
- **UMGAP Max Sensitivity**: Optimized for highest sensitivity, with a small setback on precision.
- **UMGAP Tryptic Sensitivity**: Made for fast analyses on your laptop. Get a quick overview of your data.

Throughout this documentation, the term peptides is used for both tryptic peptides and k-mers. The term taxon ID refers
to an identifier of an NCBI taxonomy (which should be the same version in the whole pipeline).

The UMGAP is free and open-source software under the MIT License and all code is available on
[Github](https://github.com/unipept/umgap). In case you have encountered an issue using these tools, have feature
requests or found a bug, don't hesitate to contact us by email ([unipept@ugent.be](mailto:unipept@ugent.be)), or create an
[issue](https://github.com/unipept/umgap/issues) on Github.

## UMGAP functionality {#functionality}

| Resource | Description |
| -------- | ----------- |
| [**fastq2fasta**](./fastq2fasta.md) | Interleaves a number of FASTQ files into a single FASTA output |
| [**translate**](./translate.md) | Translates DNA into Amino Acid Sequences |
| [**prot2tryp**](./prot2tryp.md) | Splits each protein sequence in a FASTA format into a list of (tryptic) peptides |
| [**prot2kmer**](./prot2kmer.md) | Splits each protein sequence in a FASTA format into a list of kmers |
| [**filter**](./filter.md) | Filter peptides in a FASTA format based on specific criteria |
| [**pept2lca**](./pept2lca.md) | Looks up each line of input in a given FST index and outputs the result. Lines starting with a '>' are copied. Lines for which no mapping is found are ignored |
| [**prot2tryp2lca**](./prot2tryp2lca.md) | Reads all the records in a specified FASTA file and queries the tryptic peptides in an FST for the LCAs |
| [**prot2kmer2lca**](./prot2kmer2lca.md) | Reads all the records in a specified FASTA file and queries the k-mers in an FST for the LCAs |
| [**bestof**](./bestof.md) | Pick the frame with the most none-root hits |
| [**seedextend**](./seedextend.md) | Seed and extend |
| [**uniq**](./uniq.md) | Concatenates the data strings of all consecutive FASTA entries with the same header |
| [**taxa2agg**](./taxa2agg.md) | Aggregates taxa to a single taxon |
| [**snaptaxon**](./snaptaxon.md) | Snap taxa to a specified rank or one of the specified taxa |
| [**taxa2freq**](./taxa2freq.md) | Count and report on a list of taxon IDs |
| [**taxa2tree**](./taxa2tree.md) | Visualizes the given list of taxons using the Unipept API |
| [**taxonomy**](./taxonomy.md) | Show taxonomy info |
| [**splitkmers**](./splitkmers.md) | Splits each protein sequence in a CSV format into a list of kmers |
| [**joinkmers**](./joinkmers.md) | Groups a CSV by equal first fields (k-mers) and aggregates the second fields (taxon IDs) |
| [**buildindex**](./buildindex.md) | Write an FST index of stdin on stdout |
| [**printindex**](./printindex.md) | Print the values in an FST index to stdout |

## Installation {#installation}

To use UMGAP, Rust needs to be installed on your system. We recommend the lastest version, but all versions since Rust
1.35 are supported. To check if you have the correct Ruby version installed, open a terminal and run `rustc --version`.

```console
$ rustc --version
rustc 1.42.0
```

::: info Installing Rust
If the `rustc --version` command returns *command not found*, Rust is not yet installed on your system. More information
on installing Rust can be found at [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install).
:::

The next step is to download the UMGAP source code. The easiest way to do this, is by cloning our git repository using
`git clone https://github.com/unipept/umgap.git`. Alternatively, you can also click the download button on
[Github](https://github.com/unipept/umgap).

Next, we're ready to compile and install UMGAP. First navigate to the directory where you cloned or downloaded the code,
then run `cargo install --path .`. The output should look like this:

```console
$ cargo install --path .
Installing umgap v0.3.5 (/Users/unipept/Downloads/umgap)
Updating crates.io index
Downloaded num-traits v0.2.11
Downloaded error-chain v0.12.2
...
Compiling structopt v0.3.13
Compiling umgap v0.3.5 (/Users/bart/Downloads/umgap)
Finished release [optimized] target(s) in 1m 50s
Installed package `umgap v0.3.5 (/Users/unipept/Downloads/umgap)` (executable `umgap`)
warning: be sure to add `/Users/unipept/.cargo/bin` to your PATH to be able to run the installed binaries
```

UMGAP should now be installed to the `~/.cargo/bin` directory. To access it everywhere, be sure to add it to your
`$PATH`.

After successful installation, the UMGAP command should be available. To check if it was installed correctly, run `umgap
--version`. This should print the version number:

```console
$ umgap --version
umgap 0.3.5
```

More information about the installed command can be found on these pages, or by running the `umgap --help` command.

## Updates {#updates}

To update UMGAP, simply repeat the install instructions and be sure to redownload the source code. The changes between
releases are listed in the [changelog](/news).

## Configuration {#configuration}

If you want to use FragGeneScanPlusPlus as gene predictor, this needs to be installed as well. Instructions can be found
at [https://github.com/unipept/FragGeneScanPlusPlus](https://github.com/unipept/FragGeneScanPlusPlus).

Run the configuration script at `scripts/umgap-setup.sh` to interactively configure UMGAP and download the data files
required for some steps of the pipeline.

Depending on which type of analysis you are planning, you will need the tryptic index file (less powerfull, but runs on
any decent laptop) and the 9-mer index file (uses about 100GB disk space for storage and as much RAM during operation.
The exact size depends on the version.)

To check if the configuration was successful, you can run a sample analysis with some include test data. The following
command should show you a FASTA-like file with a taxon ID per header.

```console
$ ./scripts/umgap-analyse.sh -1 testdata/A1.fq -2 testdata/A2.fq -t tryptic-sensitivity -o - | tee output.fa
```


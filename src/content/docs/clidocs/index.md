---
title: Unipept CLI documentation v4.2.2
subtitle: The Unipept command line interface (CLI) offers an easy way to integrate Unipept metaproteomics functionality into your data processing pipelines and scripts.
menuLabel: Overview
---

These tools provide a command line interface to the [Unipept web services](../apidocs/index.md) and a few utility
commands for handling proteins using the command line. All tools support fasta and plain text input, multiple output
formats (csv, xml and json) and parallel web requests for improved performance.

The Unipept command line tools are open source under the MIT License and all code is available on
[Github](https://github.com/unipept/unipept-cli). Changes between releases are listed in the [changelog](/news/cli). In
case you have encountered an issue using these tools, have feature requests or found a bug, don't hesitate to contact us
by email ([unipept@ugent.be](mailto:unipept@ugent.be)), or create an [issue](https://github.com/unipept/unipept-cli/issues) on
Github.

## CLI functionality {#functionality}

| Resource | Description |
| -------- | ----------- |
| [**uniprot**](./uniprot.md) | Fetches UniProt entries based on their accession numbers. |
| [**prot2pept**](./prot2pept.md) | Splits proteins into peptides based on (trypsin) digest. |
| [**peptfilter**](./peptfilter.md) | Filters peptides based on length and amino acid occurrence. |
| [**unipept pept2prot**](./pept2prot.md) | Returns the set of UniProt entries containing a given tryptic peptide. |
| [**unipept pept2taxa**](./pept2taxa.md) | Returns the set of taxa extracted from the UniProt entries containing a given tryptic peptide. |
| [**unipept pept2lca**](./pept2lca.md) | Returns the taxonomic lowest common ancestor for a given tryptic peptide. |
| [**unipept pept2ec**](./pept2ec.md) | Returns the functional EC-numbers associated with a given tryptic peptide. |
| [**unipept pept2go**](./pept2go.md) | Returns the functional GO-terms associated with a given tryptic peptide. |
| [**unipept pept2interpro**](./pept2interpro.md) | Returns the functional InterPro entries associated with a given tryptic peptide. |
| [**unipept pept2funct**](./pept2funct.md) | Returns the functional EC-numbers, GO-terms and InterPro entries associated with a given tryptic peptide. |
| [**unipept peptinfo**](./peptinfo.md) | Returns functional information and the lowest common ancestor for a given tryptic peptide. |
| [**unipept protinfo**](./protinfo.md) | Returns functional and taxonomic information for a given UniProt accession number. |
| [**unipept taxa2lca**](./taxa2lca.md) | Returns the taxonomic lowest common ancestor for a given list of taxon identifiers. |
| [**unipept taxonomy**](./taxonomy.md) | Returns the taxonomic information for a given taxon identifier. |

## Installation {#installation}

To use the Unipept command line tools, Node.js 22 or higher needs to be installed on your system. To check which version
you have, open a terminal and run `node --version`.

```console
$ node --version
v22.3.0
```

::: info Installing Node.js
If the `node --version` command returns command not found, Node.js is not yet installed on your system. More information
on installing Node.js can be found at
[https://nodejs.org/en/download/package-manager](https://nodejs.org/en/download/package-manager).
:::

The Unipept CLI is available as an [npm package](https://www.npmjs.com/package/unipept-cli). This means it can easily be
installed with the `npm install` command:

```console
$ npm install -g unipept-cli
added 3 packages in 986ms
```

After successful installation, the unipept command should be available. To check if unipept was installed correctly, run
`unipept --version`. This prints the version of the CLI, followed by the UniProt release that the Unipept database was
built from:

```console
$ unipept --version
4.2.2 (UniProt 2026.02)
```

More information about the installed command can be found on these pages, or by running the `unipept -h` command.

### Running without installing

The CLI can also be run straight through `npx`, which ships with Node.js. This is handy for trying a command out, and
for pinning an exact version so that an analysis can be reproduced without asking anyone to install anything.

```console
$ npx unipept-cli pept2lca AALTER
peptide,cutoff_used,taxon_id,taxon_name,taxon_rank
AALTER,1,1,root,no rank

$ npx unipept-cli@4.2.2 --version
4.2.2 (UniProt 2026.02)
```

`npx unipept-cli` runs the `unipept` command. The other three commands are separate binaries in the same package, so
they need `-p` to say which package to take them from.

```console
$ echo "AALTERSVKAAPKR" | npx -p unipept-cli prot2pept
AALTER
SVK
AAPK
R
```

::: info npx and older versions
`npx unipept-cli` works from version 4.2.2 onwards. For earlier versions, name the command explicitly with `npx -p
unipept-cli@4.2.1 unipept`.
:::

::: info Permission problems
A global install writes to a directory that your user may not have write access to, which shows up as an `EACCES` error.
Rather than installing with `sudo`, it is better to point npm at a directory you own. More information can be found on
the [npm website](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally).
:::

## Updates {#updates}

To update the Unipept command line tools to the latest version, simply run `npm update -g unipept-cli`. The changes
between releases are listed in the [changelog](/news).

```console
$ npm update -g unipept-cli
changed 1 package in 1s
```

## Configuration {#configuration}

The Unipept command line tools require no configuration and can be used immediately after installation. By default, the
public Unipept server is used for all commands.

If you have a local Unipept server running and wish to use it, pass its address to the `--host` option. The option
belongs to the subcommand rather than to `unipept` itself, so it goes after the subcommand name:

```console
$ unipept pept2lca --host http://local.server AALTER
```

::: info Setting a default server
Earlier versions of the CLI had a `unipept config` subcommand for storing a default host. It no longer exists, so the
host has to be given per command.
:::


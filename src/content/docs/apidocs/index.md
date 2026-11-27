---
title: Unipept API documentation
subtitle: Most of the peptide analysis workflows provided by Unipept are available as web services. This page contains the documentation on how to use these services.
menuLabel: Overview
---

The Unipept API is HTTP-based and always returns JSON objects as response. The table below lists the endpoints of the
current version of the API.

If you use this API, please cite Mesuere et al. (2016) Bioinformatics
[doi:10.1093/bioinformatics/btw039](https://academic.oup.com/bioinformatics/article/32/11/1746/1742840?login=false).

## API functionality {#functionality}

| Endpoint | Description |
| -------- | ----------- |
| [**pept2prot**](./pept2prot.md) | Returns the set of UniProt entries containing a given peptide. |
| [**pept2taxa**](./pept2taxa.md) | Returns the set of taxa extracted from the UniProt entries containing a given peptide. |
| [**pept2lca**](./pept2lca.md) | Returns the taxonomic lowest common ancestor for a given peptide. |
| [**pept2ec**](./pept2ec.md) | Returns the functional EC-numbers associated with a given peptide. |
| [**pept2go**](./pept2go.md) | Returns the functional GO-terms associated with a given peptide. |
| [**pept2interpro**](./pept2interpro.md) | Returns the functional InterPro entries associated with a given peptide. |
| [**pept2funct**](./pept2funct.md) | Returns the functional EC-numbers, GO-terms and InterPro entries associated with a given peptide. |
| [**peptinfo**](./peptinfo.md) | Returns functional information and the lowest common ancestor for a given peptide. |
| [**protinfo**](./protinfo.md) | Returns functional information and the lowest common ancestor for a given UniProtKB protein. |
| [**taxa2lca**](./taxa2lca.md) | Returns the taxonomic lowest common ancestor for a given list of taxon identifiers. |
| [**taxa2tree**](./taxa2tree.md) | Returns the taxonomic tree for a given list of taxon identifiers. |
| [**taxonomy**](./taxonomy.md) | Returns the taxonomic information for a given taxon identifier. |

## Making requests {#requests}

Each endpoint has its own URL: `https://api.unipept.ugent.be/api/v2/` followed by its name, such as
`https://api.unipept.ugent.be/api/v2/pept2lca`.
Send a POST request (preferred) with the parameters in the request body, or a GET request with the parameters in the
query string.
A parameter that takes a list, such as `input[]`, is repeated once for each value:

```console
$ curl -X POST -H 'Accept: application/json' api.unipept.ugent.be/api/v2/pept2lca \
  -d 'input[]=AIPQLEVARPADAYETAEAYR' -d 'input[]=APVLSDSSCK'
```

The page of each endpoint lists its parameters and response fields, with examples that you can run.
[taxa2tree](./taxa2tree.md) is the exception to the rules above: a POST request to it takes `counts` instead of
`input[]`.

## Large requests {#large-requests}

Unipept puts no restrictions on the number of inputs in a request.
Keep in mind that a request with lots of inputs may time out or, in the case of a GET request, exceed the maximum URL
length.
When performing bulk searches, we suggest splitting the input set over requests of 100 inputs each.

## API versions {#versions}

::: info NCBI taxonomy changes
NCBI has changed its taxonomy classifications
([see announcement](https://ncbiinsights.ncbi.nlm.nih.gov/2024/06/04/changes-ncbi-taxonomy-classifications/)), and
Unipept's taxonomic data follows these changes.
The rank "superkingdom" no longer exists in the NCBI taxonomy, so the API no longer returns it.
The ranks "domain" and "realm" have been added.
:::

Version 1 of the API is no longer supported. Its endpoints remain reachable, but they are served by the version 2
implementation and return exactly the same responses.

## Unipept CLI {#cli}

The [Unipept CLI](/clidocs) is a command line interface to these web services. It reads fasta and plain text input,
writes CSV, XML or JSON, and sends its web requests in parallel for better performance.

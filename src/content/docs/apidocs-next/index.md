---
title: Unipept API documentation v2.0
subtitle: Most of the peptide analysis workflows provided by Unipept are available as web services. This page contains the documentation on how to use these services.
menuLabel: Overview
---

::: warning NCBI taxonomy changes
Recently, NCBI has introduced changes to their taxonomy classifications ([see announcement](https://ncbiinsights.ncbi.nlm.nih.gov/2024/06/04/changes-ncbi-taxonomy-classifications/)).
In response to this update, we have aligned Unipept’s taxonomic data accordingly. Since the rank "superkingdom" no longer exists in the NCBI taxonomy, we are unable to provide support for this rank in our API.

🔁 **As a result, the V1 and V2 endpoints of the Unipept API now produce identical taxonomic results, and can be used interchangeably. The rank "superkingdom" is no longer available, and the ranks "domain" and "realm" have been introduced.**

Support for V1 of the Unipept API has been dropped. The V1 endpoints remain reachable, but they are served by the V2 implementation and return exactly the same responses.
:::

The Unipept API is HTTP-based and always returns JSON objects as response. The current version of the API provides
12 endpoints.

If you use this API, please cite Mesuere et al. (2016) Bioinformatics
[doi:10.1093/bioinformatics/btw039](https://academic.oup.com/bioinformatics/article/32/11/1746/1742840?login=false)

## API functions {#functionality}

| Resource | Description |
|---|---|
| [POST /api/v2/pept2prot](./pept2prot.md) | Returns the set of UniProt entries containing a given peptide. |
| [POST /api/v2/pept2taxa](./pept2taxa.md) | Returns the set of taxa extracted from the UniProt entries containing a given peptide. |
| [POST /api/v2/pept2lca](./pept2lca.md) | Returns the taxonomic lowest common ancestor for a given peptide. |
| [POST /api/v2/pept2ec](./pept2ec.md) | Returns the functional EC-numbers associated with a given peptide. |
| [POST /api/v2/pept2go](./pept2go.md) | Returns the functional GO-terms associated with a given peptide. |
| [POST /api/v2/pept2interpro](./pept2interpro.md) | Returns the functional InterPro entries associated with a given peptide. |
| [POST /api/v2/pept2funct](./pept2funct.md) | Returns the functional EC-numbers, GO-terms and InterPro entries associated with a given peptide. |
| [POST /api/v2/peptinfo](./peptinfo.md) | Returns functional information and the lowest common ancestor for a given peptide. |
| [POST /api/v2/protinfo](./protinfo.md) | Returns functional information and the lowest common ancestor for a given UniProtKB protein. |
| [POST /api/v2/taxa2lca](./taxa2lca.md) | Returns the taxonomic lowest common ancestor for a given list of taxon identifiers. |
| [POST /api/v2/taxa2tree](./taxa2tree.md) | Returns the taxonomic tree for a given list of taxon identifiers. |
| [POST /api/v2/taxonomy](./taxonomy.md) | Returns the taxonomic information for a given taxon identifier. |

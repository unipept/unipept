---
title: taxa2lca
subtitle: Returns the taxonomic lowest common ancestor for a given list of taxon identifiers.
layout: api
parameters:
  - name: "input[]"
    type: integer
    required: true
    summary: List of taxon identifiers to calculate the lowest common ancestor for. Add multiple parameters to specify multiple taxon id's.
    details: |
      `input[]` is a required parameter that takes at least two taxon identifiers.
      Unipept will calculate and return the taxonomic lowest common ancestor of the given taxa.
      To pass multiple taxon identifiers, simply add multiple `input[]` parameters (see the *Multiple taxa* example).

      For large inputs, see [Large requests](./index.md#large-requests).
  - name: extra
    type: boolean
    default: false
    summary: Return additional lineage information fields if `true`.
    details: |
      When the parameter is set to `true`, Unipept will return the complete lineage of the taxonomic lowest common ancestor.
      See the [response](#response) section for an overview of the information fields returned.
  - name: names
    type: boolean
    default: false
    summary: Return names of ranks in the lineage if `true`.
    details: |
      When both `names` and `extra` are set to `true`, Unipept will return the names of all ranks in the lineage of the taxonomic lowest common ancestor.
      Setting only `names` to `true` will not result in additional information fields being returned.
      See the [response](#response) section for an overview of the information fields returned.

      ::: tip Performance penalty
      Setting `names` to `true` has a performance penalty inferred from additional database queries.
      Do not use this parameter unless the extra information fields are needed.
      :::
  - name: validate_taxa
    type: boolean
    default: true
    summary: Ignore invalid and uninformative taxa when calculating the lowest common ancestor.
    details: |
      When the parameter is set to `true`, taxa that are no longer valid in the NCBI taxonomy, as well as
      taxa that carry no meaningful classification (such as *uncultured bacterium* or *Bacteria incertae sedis*), are left out of the
      calculation. Setting it to `false` takes all taxa into account, which usually results in a less specific
      lowest common ancestor.
response:
  summary: |
    The taxonomic lowest common ancestor for the given list of taxon identifiers is returned as a JSON object.
    By default, the object contains the following information fields extracted from the NCBI taxonomy:
  fields:
    - name: taxon_id
      type: integer
      summary: The NCBI taxon id of the taxonomic lowest common ancestor.
    - name: taxon_name
      type: string
      summary: The name of the taxonomic lowest common ancestor.
    - name: taxon_rank
      type: string
      summary: The taxonomic rank of the taxonomic lowest common ancestor.
    - name: <rank>_id
      type: integer or null
      when: extra
      ranks: id
      summary: The taxon id of each rank in the lineage.
      details: |
        When the `extra` parameter is set to `true`, the object contains additional information about the lineage of the taxonomic lowest common ancestor extracted from the NCBI taxonomy.
    - name: <rank>_name
      type: string
      when: extra and names
      ranks: name
      summary: The name of each rank in the lineage.
examples:
  - title: Multiple taxa
    description: |
      This example calculates and retrieves the taxonomic lowest common ancestor of *Bacteroides fragilis* (taxon id [817](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817)), *Bacteroides intestinalis* (taxon id [329854](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854)) and *Coprobacter fastidiosus* (taxon id [1099853](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853)).
    params: { input: ["817", "329854", "1099853"] }
  - title: With the lineage
    description: |
      This example calculates and retrieves the taxonomic lowest common ancestor of *Bacteroides fragilis* (taxon id [817](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817)), *Bacteroides intestinalis* (taxon id [329854](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854)) and *Coprobacter fastidiosus* (taxon id [1099853](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853)), including its complete lineage.
    params: { input: ["817", "329854", "1099853"], extra: true }
  - title: With lineage names
    description: |
      This example calculates and retrieves the taxonomic lowest common ancestor of *Bacteroides fragilis* (taxon id [817](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817)), *Bacteroides intestinalis* (taxon id [329854](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854)) and *Coprobacter fastidiosus* (taxon id [1099853](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853)), including its complete lineage with names.
    params: { input: ["817", "329854", "1099853"], extra: true, names: true }
---

This method calculates and returns the taxonomic lowest common ancestor for a given list of NCBI taxon identifiers.

[Making requests](./index.md#requests) explains how to send a request to this endpoint.

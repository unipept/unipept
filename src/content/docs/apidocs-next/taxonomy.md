---
title: taxonomy
subtitle: Returns the taxonomic information for a given taxon identifier.
layout: api
parameters:
  - name: "input[]"
    type: string
    required: true
    summary: Taxon identifier to search for. Add multiple parameters to search for multiple taxon identifiers.
    details: |
      Unipept will return the taxonomic information for the given taxa.
      To pass multiple taxon identifiers, simply add multiple `input[]` parameters (see the *Multiple taxa* example).

      ::: tip Input size
      Unipept puts no restrictions on the number of taxon identifiers passed to the `input[]` parameter.
      Keep in mind that searching for lots of taxon identifiers at once may cause the request to timeout or, in the case of a GET-request, exceed the maximum URL length.
      When performing bulk searches, we suggest splitting the input set over requests of 100 taxon identifiers each.
      :::
  - name: extra
    type: boolean
    default: false
    summary: Return additional lineage information fields if `true`.
    details: |
      When the parameter is set to `true`, Unipept will return the complete lineage for each taxon.
      See the [response](#response) section for an overview of the information fields returned.
  - name: names
    type: boolean
    default: false
    summary: Return names of ranks in the lineage if `true`.
    details: |
      When both `names` and `extra` are set to `true`, Unipept will return the names of all ranks in the lineage of each organism.
      Setting only `names` to `true` will not result in additional information fields being returned.
      See the [response](#response) section for an overview of the information fields returned.

      ::: tip Performance penalty
      Setting `names` to `true` has a performance penalty inferred from additional database queries.
      Do not use this parameter unless the extra information fields are needed.
      :::
  - name: descendants
    type: boolean
    default: false
    summary: Return all descendants for each input taxon.
    details: |
      When the parameter is set to `true`, Unipept will also return all the descendants for each taxon.
  - name: descendants_ranks
    type: "a valid list of NCBI ranks, see [request](#request)"
    summary: "Return only descendants of the given ranks for each input taxon. `[ \"species\" ]` (default)."
    details: |
      `descendants_ranks` is an optional parameter and should be a list of NCBI ranks. Possible values are listed below.
      When not set explicitly, the parameter defaults to `[ "species" ]`. When the parameter is set to a non-empty list
      of ranks, Unipept will only return the descendants of the given ranks for each taxon.

      <div class="columns">

      - `domain`
      - `realm`
      - `kingdom`
      - `subkingdom`
      - `superphylum`
      - `phylum`
      - `subphylum`
      - `superclass`
      - `class`
      - `subclass`
      - `superorder`
      - `order`
      - `suborder`
      - `infraorder`
      - `superfamily`
      - `family`
      - `subfamily`
      - `tribe`
      - `subtribe`
      - `genus`
      - `subgenus`
      - `species_group`
      - `species_subgroup`
      - `species`
      - `subspecies`
      - `strain`
      - `varietas`
      - `forma`

      </div>
response:
  summary: |
    The organisms associated with the given taxon identifiers are returned as a list of JSON objects.
    By default, each object contains the following information fields extracted from the UniProt entry and NCBI taxonomy:
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
        When the `extra` parameter is set to `true`, the object contains additional information about the lineage of the organisms
        extracted from the NCBI taxonomy.
    - name: <rank>_name
      type: string
      when: extra and names
      ranks: name
      summary: The name of each rank in the lineage.
    - name: descendants
      type: list of integers
      when: descendants
      summary: A list of the NCBI taxon ids of all taxa below the requested taxon that sit at one of the ranks given by `descendants_ranks`.
examples:
  - title: One taxon
    description: |
      This example retrieves taxonomic information for the organism *Bacteroides fragilis* (taxon id [817](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817)).
    params: { input: ["817"] }
  - title: Multiple taxa
    description: |
      This example retrieves taxonomic information for the organism *Bacteroides fragilis* (taxon id [817](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817)) and *Bacteroides intestinalis* (taxon id [329854](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854)).
    params: { input: ["817", "329854"] }
  - title: With the lineage
    description: |
      This example retrieves taxonomic information for the organism *Bacteroides fragilis* (taxon id [817](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817)), including its complete lineage.
    params: { input: ["817"], extra: true }
  - title: With lineage names
    description: |
      This example retrieves taxonomic information for the organism *Bacteroides fragilis* (taxon id [817](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817)), including its complete lineage with names.
    params: { input: ["817"], extra: true, names: true }
---

This method returns the taxonomic information from the Unipept Taxonomy, for a given NCBI taxon identifier.

Send a POST request (preferred) or a GET request to the URL above.
[Parameters](#parameters) can be included in the request body (POST) or in the query string (GET).

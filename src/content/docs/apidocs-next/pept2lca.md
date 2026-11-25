---
title: pept2lca
subtitle: Returns the taxonomic lowest common ancestor for a given peptide.
layout: api
parameters:
  - name: "input[]"
    type: string
    required: true
    summary: Peptide to search for. Add multiple parameters to search for multiple peptides.
    details: |
      Unipept will return the taxonomic lowest common ancestor for each of the `input[]` peptides based on their occurrence in UniProt entries.
      To pass multiple peptides at once, simply add multiple `input[]` parameters (see the *Multiple peptides* example).

      ::: tip Input size
      Unipept puts no restrictions on the number of peptides passed to the `input[]` parameter.
      Keep in mind that searching for lots of peptides at once may cause the request to timeout or, in the case of a GET-request, exceed the maximumURL length.
      When performing bulk searches, we suggest splitting the input set over requests of 100 peptides each.
      :::
  - name: equate_il
    type: boolean
    default: true
    summary: Equate isoleucine (I) and leucine (L).
    details: |
      When the parameter is set to `true`, isoleucine (I) and leucine (L) are equated when matching peptides to UniProt entries.
      This setting is similar to checking the *Equate I and L* checkbox when performing a search with the [Single Peptide Analysis](/tpa) in the web interface.
  - name: extra
    type: boolean
    default: false
    summary: Return additional information fields if `true`.
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
    The taxonomic lowest common ancestors associated with the given peptides are returned as a list of JSON objects.
    By default, each object contains the following information fields extracted from the UniProt entry and NCBI taxonomy.
    If a peptide matches more than 10,000 proteins, the response is truncated and `cutoff_used` is set to `true`.
  fields:
    - name: peptide
      type: string
      summary: The peptide that was searched for.
    - name: cutoff_used
      type: boolean
      summary: "`true` if the number of matched proteins exceeded the cutoff (default: 10,000 proteins) and the response was truncated; `false` otherwise."
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
        When the `extra` parameter is set to `true`, objects contain additional information about the lineage of the taxonomic lowest common ancestor extracted from the NCBI taxonomy.
    - name: <rank>_name
      type: string
      when: extra and names
      ranks: name
      summary: The name of each rank in the lineage.
examples:
  - title: One peptide
    description: |
      This example retrieves the taxonomic lowest common ancestor for the peptide *AIPQLEVARPADAYETAEAYR*.
    params: { input: [AIPQLEVARPADAYETAEAYR] }
  - title: Multiple peptides
    description: |
      This example retrieves the taxonomic lowest common ancestor for both the peptides *AIPQLEVARPADAYETAEAYR* and *APVLSDSSCK*.
    params: { input: [AIPQLEVARPADAYETAEAYR, APVLSDSSCK] }
  - title: Equating I and L
    description: |
      This example retrieves the taxonomic lowest common ancestor for the peptide *APVLSDSSCK*.
      In searching, isoleucine (I) and leucinge (L) are considered equal.
    params: { input: [APVISDSSCK], equate_il: true }
  - title: With the lineage
    description: |
      This example retrieves the taxonomic lowest common ancestor for the peptide *AIPQLEVARPADAYETAEAYR* including its complete lineage.
    params: { input: [AIPQLEVARPADAYETAEAYR], extra: true }
  - title: With lineage names
    description: |
      This example retrieves the taxonomic lowest common ancestor for the peptide *AIPQLEVARPADAYETAEAYR* including its complete lineage with names.
    params: { input: [AIPQLEVARPADAYETAEAYR], extra: true, names: true }
---

This method returns the taxonomic lowest common ancestor for a given peptide.
This is the same information as provided when performing a search with the [Single Peptide Analysis](/tpa) in the web interface.

Send a POST request (preferred) or a GET request to the URL above.
[Parameters](#parameters) can be included in the request body (POST) or in the query string (GET).

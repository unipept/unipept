---
title: pept2taxa
subtitle: Returns the set of taxa extracted from the UniProt entries containing a given peptide.
layout: api
parameters:
  - name: "input[]"
    type: string
    required: true
    summary: Peptide to search for. Add multiple parameters to search for multiple peptides.
    details: |
      Unipept will return the set of organisms associated with the UniProt entries that contain any of the `input[]` peptides in their protein sequence.
      To pass multiple peptides at once, simply add multiple `input[]` parameters (see the *Multiple peptides* example).

      For large inputs, see [Large requests](./index.md#large-requests).
  - name: equate_il
    type: boolean
    default: true
    summary: Equate isoleucine (I) and leucine (L).
    details: |
      When the parameter is set to `true`, isoleucine (I) and leucine (L) are equated when matching tryptic
      peptides to UniProt entries. This setting is similar to checking the *Equate I and L* checkbox when performing a search with the
      [Single Peptide Analysis](/tpa) in the web interface.
  - name: extra
    type: boolean
    default: false
    summary: Return additional information fields if `true`.
    details: |
      When the parameter is set to `true`, Unipept will return the complete lineage of each organism.
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
  - name: compact
    type: boolean
    default: false
    summary: Returns a compact version of the taxa.
    details: |
      When the parameter is set to `true`, Unipept will only return the list of taxon identifiers, rather than the name, rank
      and identifier of each taxon.
  - name: tryptic
    type: boolean
    default: false
    summary: Return only tryptic matches if `true`.
    details: |
      When the parameter is set to `true`, Unipept will only return tryptic matches.
response:
  summary: |
    The organisms associated with matching UniProt entries are returned as a list of JSON objects. By default, each object
    contains the following information fields extracted from the UniProt entry and NCBI taxonomy.
    If a peptide matches more than 10,000 proteins, the response is truncated and `cutoff_used` is set to `true`.

    When the `compact` parameter is set to `true`, each object instead contains
    `peptide`, `cutoff_used` and a single `taxa` field holding the list of
    matched taxon identifiers. One object is returned per peptide rather than one per matched taxon, and the
    `extra` and `names` parameters have no effect.
  fields:
    - name: peptide
      type: string
      summary: The peptide that matched this record.
    - name: cutoff_used
      type: boolean
      summary: "`true` if the number of matched proteins exceeded the cutoff (default: 10,000 proteins) and the response was truncated; `false` otherwise."
    - name: taxon_id
      type: integer
      summary: The NCBI taxon id of the organism associated with the matching record.
    - name: taxon_name
      type: string
      summary: The name of the organism associated with the matching record.
    - name: taxon_rank
      type: string
      summary: The taxonomic rank of the organism associated with the matching record.
    - name: <rank>_id
      type: integer or null
      when: extra
      ranks: id
      summary: The taxon id of each rank in the lineage.
      details: |
        When the `extra` parameter is set to `true`, objects contain additional information about the lineages of the organism extracted from the NCBI taxonomy.
    - name: <rank>_name
      type: string
      when: extra and names
      ranks: name
      summary: The name of each rank in the lineage.
examples:
  - title: One peptide
    description: |
      This example retrieves all organisms associated with the UniProt entries containing the peptide *AIPQLEVARPADAYETAEAYR*.
    params: { input: [AIPQLEVARPADAYETAEAYR] }
  - title: Multiple peptides
    description: |
      This example retrieves all organisms associated with the UniProt entries containing the peptide *AIPQLEVARPADAYETAEAYR* or *APVLSDSSCK*.
    params: { input: [AIPQLEVARPADAYETAEAYR, APVLSDSSCK] }
  - title: Equating I and L
    description: |
      This example retrieves all organisms associated with the UniProt entries containing the peptide *APVISDSSCK*.
      In searching, isoleucine (I) and leucine (L) are considered equal.
    params: { input: [APVISDSSCK], equate_il: true }
  - title: With the lineage
    description: |
      This example retrieves all organisms associated with the UniProt entries containing the peptide *AIPQLEVARPADAYETAEAYR* including the complete lineage of these organisms.
    params: { input: [AIPQLEVARPADAYETAEAYR], extra: true }
  - title: With lineage names
    description: |
      This example retrieves all organisms associated with the UniProt entries containing the peptide *AIPQLEVARPADAYETAEAYR*, including the complete lineage of these organisms with the names of all ranks.
    params: { input: [AIPQLEVARPADAYETAEAYR], extra: true, names: true }
---

This method returns the set of organisms associated with the UniProt entries containing a given peptide.
This is the same information as provided on the *Lineage table* tab when performing a search with the [Single Peptide Analysis](/tpa) in the web interface.

[Making requests](./index.md#requests) explains how to send a request to this endpoint.

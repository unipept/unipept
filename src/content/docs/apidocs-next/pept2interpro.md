---
title: pept2interpro
subtitle: Returns the functional InterPro entries associated with a given peptide.
layout: api
parameters:
  - name: "input[]"
    type: string
    required: true
    summary: Peptide to search for. Add multiple parameters to search for multiple peptides.
    details: |
      Unipept will return the functional InterPro entries associated with each of the `input[]` peptides based on their occurrence in UniProt entries.
      To pass multiple peptides at once, simply add multiple `input[]` parameters (see the *Multiple peptides* example).

      For large inputs, see [Large requests](./index.md#large-requests).
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
      When the parameter is set to `true`, Unipept will also return the name associated with an InterPro entry.
      See the [response](#response) section for an overview of the information fields returned.
  - name: domains
    type: boolean
    default: false
    summary: Group the InterPro entries by type.
    details: |
      When `true`, the InterPro entries are grouped by type (domain, family, homologous superfamily, repeat, conserved site, active site, binding site, PTM).

      ::: tip Performance penalty
      Setting `extra` to `true` has a performance penalty inferred from additional database queries.
      Do not use this parameter unless the extra information fields are needed.
      :::
response:
  summary: |
    A list of JSON objects is returned. By default, each object contains the following information fields.
    If a peptide matches more than 10,000 proteins, the response is truncated and `cutoff_used` is set to `true`.
  fields:
    - name: peptide
      type: string
      summary: The peptide that was searched for.
    - name: cutoff_used
      type: boolean
      summary: "`true` if the number of matched proteins exceeded the cutoff (default: 10,000 proteins) and the response was truncated; `false` otherwise."
    - name: total_protein_count
      type: integer
      summary: Total number of proteins that match the peptide.
    - name: ipr
      type: list of objects
      summary: A list of JSON objects that each represent an InterPro entry associated with the current peptide.
      fields:
        - name: code
          type: string
          summary: InterPro entry code associated with the current peptide.
        - name: protein_count
          type: integer
          summary: Number of proteins that match the peptide and are labeled with this InterPro code.
        - name: name
          type: string
          when: extra
          summary: Name of the InterPro entry.
        - name: type
          type: string
          when: extra
          summary: Type of the InterPro entry.
examples:
  - title: One peptide
    description: |
      This example retrieves all functional InterPro entries associated with the peptide *AIPQLEVARPADAYETAEAYR*.
    params: { input: [AIPQLEVARPADAYETAEAYR] }
  - title: Multiple peptides
    description: |
      This example retrieves the functional InterPro entries for both the peptides *AIPQLEVARPADAYETAEAYR* and *APVLSDSSCK*.
    params: { input: [AIPQLEVARPADAYETAEAYR, APVLSDSSCK] }
  - title: Equating I and L
    description: |
      This example retrieves the functional InterPro entries associated with the peptide *APVISDSSCK*.
      In searching, isoleucine (I) and leucine (L) are considered equal.
    params: { input: [APVISDSSCK], equate_il: true }
  - title: With extra information
    description: |
      This example retrieves the functional InterPro entries associated with the peptide *AIPQLEVARPADAYETAEAYR* including the name and type of each InterPro entry.
    params: { input: [AIPQLEVARPADAYETAEAYR], extra: true }
  - title: With domains
    description: |
      This example retrieves the functional InterPro entries associated with the peptide *APVLSDSSCK* distributed over the distinct InterPro types.
    params: { input: [APVLSDSSCK], domains: true }
---

This method returns the functional InterPro entries associated with a given peptide.
This is the same information as provided when performing a search with the [Single Peptide Analysis](/tpa) in the web interface.

[Making requests](./index.md#requests) explains how to send a request to this endpoint.

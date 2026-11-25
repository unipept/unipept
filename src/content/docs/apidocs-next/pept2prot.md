---
title: pept2prot
subtitle: Returns the set of UniProt entries containing a given peptide.
layout: api
parameters:
  - name: "input[]"
    type: string
    required: true
    summary: Peptide to search for. Add multiple parameters to search for multiple peptides.
    details: |
      Unipept will return the list of UniProt entries that contain any of the `input[]` peptides in their protein sequence.
      To pass multiple peptides at once, simply add multiple `input[]` parameters (see the *Multiple peptides* example).

      ::: tip Input size
      Unipept puts no restrictions on the number of peptides passed to the `input[]` parameter.
      Keep in mind that searching for lots of peptides at once may cause the request to timeout or, in the case of a GET-request, exceed the maximum URL length.
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
      When the parameter is set to `true`, Unipept will return additional information fields.
      See the [response](#response) section for an overview of the information fields returned.

      ::: tip Performance penalty
      Setting `extra` to `true` has a performance penalty inferred from additional database queries.
      Do not use this parameter unless the extra information fields are needed.
      :::
  - name: tryptic
    type: boolean
    default: false
    summary: Return only tryptic matches if `true`.
    details: |
      When the parameter is set to `true`, Unipept will only return tryptic matches.
response:
  summary: |
    Matching UniProt entries are returned as a list of JSON objects. By default, each object contains the following information
    fields extracted from the UniProt entry.
    If a peptide matches more than 10,000 proteins, the response is truncated and `cutoff_used` is set to `true`.
  fields:
    - name: peptide
      type: string
      summary: The peptide that matched this record.
    - name: cutoff_used
      type: boolean
      summary: "`true` if the number of matched proteins exceeded the cutoff (default: 10,000 proteins) and the response was truncated; `false` otherwise."
    - name: uniprot_id
      type: string
      summary: The UniProt accession number of the matching record.
    - name: protein_name
      type: string
      summary: The name of the protein of the matching record.
    - name: taxon_id
      type: integer
      summary: The NCBI taxon id of the organism associated with the matching record.
    - name: protein
      type: string
      summary: The amino acid sequence of the matching record.
    - name: taxon_name
      type: string
      when: extra
      summary: The name of the organism associated with the matching UniProt entry.
    - name: ec_references
      type: string
      when: extra
      summary: A space separated list of associated EC numbers.
    - name: go_references
      type: string
      when: extra
      summary: A space separated list of associated GO terms.
    - name: interpro_references
      type: string
      when: extra
      summary: A space separated list of associated InterPro entry codes.
examples:
  - title: One peptide
    description: |
      This example retrieves all UniProt entries containing the peptide *AIPQLEVARPADAYETAEAYR*.
    params: { input: [AIPQLEVARPADAYETAEAYR] }
  - title: Multiple peptides
    description: |
      This example retrieves all UniProt entries containing either the peptide *AIPQLEVARPADAYETAEAYR* or the peptide *APVLSDSSCK*.
    params: { input: [AIPQLEVARPADAYETAEAYR, APVLSDSSCK] }
  - title: Equating I and L
    description: |
      This example retrieves all UniProt entries containing the peptide *APVLSDSSCK*.
      In searching, isoleucine (I) and leucine (L) are considered equal.
    params: { input: [APVISDSSCK], equate_il: true }
  - title: With extra information
    description: |
      This example retrieves all UniProt entries containing the peptide *AIPQLEVARPADAYETAEAYR*, including additional information fields that are not returned by default.
    params: { input: [AIPQLEVARPADAYETAEAYR], extra: true }
---

This method returns the list of UniProt entries containing a given peptide. This is the same information as provided on the Protein matches
tab when performing a search with the [Single Peptide Analysis](/tpa) in the web interface.

Send a POST request (preferred) or a GET request to the URL above.
[Parameters](#parameters) can be included in the request body (POST) or in the query string (GET).

---
title: pept2ec
subtitle: Returns the functional EC-numbers associated with a given peptide.
layout: api
parameters:
  - name: "input[]"
    type: string
    required: true
    summary: Peptide to search for. Add multiple parameters to search for multiple peptides.
    details: |
      Unipept will return the functional EC-numbers associated with each of the `input[]` peptides based on their occurrence in UniProt entries.
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
      When the parameter is set to `true`, Unipept will also return the name associated with anEC-number.
      See the [response](#response) section for an overview of the information fields returned.

      ::: tip Performance penalty
      Setting `extra` to `true` has a performance penalty inferred from additional database queries.
      Do not use this parameter unless the extra information fields are needed.
      :::
response:
  summary: |
    A list of
    JSON
    objects is returned. By default, each object contains the following information fields.
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
      summary: Total amount of proteins matched with the given peptide.
    - name: ec
      type: list of objects
      summary: A list of JSON objects that each represent an EC-number associated with the current peptide.
      fields:
        - name: ec_number
          type: string
          summary: EC-number associated with the current peptide.
        - name: protein_count
          type: integer
          summary: Amount of proteins matched with the given peptide that are labeled with the currentEC-number.
        - name: name
          type: string
          when: extra
          summary: Name of the EC-number.
examples:
  - title: One peptide
    description: |
      This example retrieves all functional EC-numbers associated with the peptide *AIPQLEVARPADAYETAEAYR*.
    params: { input: [AIPQLEVARPADAYETAEAYR] }
  - title: Multiple peptides
    description: |
      This example retrieves the functional EC-numbers for both the peptides *AIPQLEVARPADAYETAEAYR* and *APVLSDSSCK*.
    params: { input: [AIPQLEVARPADAYETAEAYR, APVLSDSSCK] }
  - title: Equating I and L
    description: |
      This example retrieves the functional EC-numbers associated with the peptide *APVLSDSSCK*.
      In searching, isoleucine (I) and leucinge (L) are considered equal.
    params: { input: [APVISDSSCK], equate_il: true }
  - title: With extra information
    description: |
      This example retrieves the functional EC-numbers associated with the peptide *AIPQLEVARPADAYETAEAYR* including the name of each EC-number.
    params: { input: [AIPQLEVARPADAYETAEAYR], extra: true }
---

This method returns the functional EC-numbers associated with a given peptide.
This is the same information as provided when performing a search with the [Single Peptide Analysis](/tpa) in the web interface.

Send a POST request (preferred) or a GET request to the URL above.
[Parameters](#parameters) can be included in the request body (POST) or in the query string (GET).

---
title: peptinfo
subtitle: Returns functional information and the lowest common ancestor for a given peptide.
layout: api
parameters:
  - name: "input[]"
    type: string
    required: true
    summary: Peptide to search for. Add multiple parameters to search for multiple peptides.
    details: |
      Unipept will return the functional EC-numbers, GO-terms and InterPro entries associated with each of the `input[]` peptides based on their occurrence in UniProt entries.
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
      When the parameter is set to `true`, Unipept will also return the name associated with a GO-term and an EC-number, the name and type associated with an InterPro entry, and the complete lineage of the taxonomic lowest common ancestor.
      See the [response](#response) section for an overview of the information fields returned.
  - name: domains
    type: boolean
    default: false
    summary: Separates GO-namespaces and InterPro types and places objects in group associated with current namespace or type when `true`.
    details: |
      `domains` is an optional parameter that can be used to order the GO-terms in groups according to their namespace (cellular component, molecular function, biological process).
  - name: names
    type: boolean
    default: false
    summary: Return names of ranks in the lineage if `true`.
    details: |
      When both `names` and `extra` are set to `true`, Unipept will return the names of all ranks in the lineage of each organism.
      Setting only `names` to `true` will not result in additional information fields being returned.
      See the [response](#response) section for an overview of the information fields returned.

      ::: tip Performance penalty
      Setting `extra`, `domains` or `names` to `true` has a performance penalty inferred from additional database queries.
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
    A list of JSON objects is returned. By default, each object contains the following information fields.
    If a peptide matches more than 10,000 proteins, the response is truncated and `cutoff_used` is set to `true`.

    When the `domains` parameter is set to `true`, objects are placed in a group corresponding to their namespace and the objects
    are nested in an additional object. See the examples for more information on how to use this.
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
          summary: Amount of proteins matched with the given peptide that are labeled with the current EC-number.
        - name: name
          type: string
          when: extra
          summary: Name of the EC-number.
    - name: go
      type: list of objects
      summary: A list of JSON objects that each represent a GO-term associated with the current peptide.
      fields:
        - name: go_term
          type: string
          summary: GO-term associated with the current peptide.
        - name: protein_count
          type: integer
          summary: Amount of proteins matched with the given peptide that are labeled with the current GO-term.
        - name: name
          type: string
          when: extra
          summary: Name of the GO-term.
    - name: ipr
      type: list of objects
      summary: A list of JSON objects that each represent an InterPro entry associated with the current peptide.
      fields:
        - name: code
          type: string
          summary: InterPro entry code associated with the current peptide.
        - name: protein_count
          type: integer
          summary: Amount of proteins matched with the given peptide that are labeled with the current InterPro code.
        - name: name
          type: string
          when: extra
          summary: Name of the InterPro entry.
        - name: type
          type: string
          when: extra
          summary: Type of the InterPro entry.
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
      This example retrieves all functional EC-numbers, GO-terms, InterPro entries and the lowest common ancestor associated with the peptide *AIPQLEVARPADAYETAEAYR*.
    params: { input: [AIPQLEVARPADAYETAEAYR] }
  - title: Multiple peptides
    description: |
      This example retrieves all functional EC-numbers, GO-terms, InterPro entries and the lowest common ancestor for both the peptides *AIPQLEVARPADAYETAEAYR* and *APVLSDSSCK*.
    params: { input: [AIPQLEVARPADAYETAEAYR, APVLSDSSCK] }
  - title: Equating I and L
    description: |
      This example retrieves all functional EC-numbers, GO-terms, InterPro entries and the lowest common ancestor associated with the peptide *APVLSDSSCK*.
      In searching, isoleucine (I) and leucinge (L) are considered equal.
    params: { input: [APVISDSSCK], equate_il: true }
  - title: With extra information
    description: |
      This example retrieves all functional EC-numbers, GO-terms, InterPro entries and the lowest common ancestor associated with the peptide *AIPQLEVARPADAYETAEAYR* including the name of each EC-number, GO-term, the name and type of each InterPro entry, and its complete lineage.
    params: { input: [AIPQLEVARPADAYETAEAYR], extra: true }
  - title: With domains
    description: |
      This example retrieves all functional EC-numbers, GO-terms, InterPro entries and the lowest common ancestor associated with the peptide *APVLSDSSCK* distributed over the distinct GO-domains and InterPro types.
    params: { input: [APVLSDSSCK], domains: true }
  - title: With domains
    description: |
      This example retrieves all functional EC-numbers, GO-terms, InterPro entries and the lowest common ancestor associated with the peptide *APVLSDSSCK* including the names of all ranks in the lineage.
    params: { input: [APVLSDSSCK], domains: true, names: true }
---

This method returns functional information and the lowest common ancestor a given peptide.
This is the same information as provided when performing a search with the [Single Peptide Analysis](/tpa) in the web interface.

Send a POST request (preferred) or a GET request to the URL above.
[Parameters](#parameters) can be included in the request body (POST) or in the query string (GET).

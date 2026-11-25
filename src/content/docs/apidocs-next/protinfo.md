---
title: protinfo
subtitle: Returns functional information and the lowest common ancestor for a given UniProtKB protein.
layout: api
parameters:
  - name: "input[]"
    type: string
    required: true
    summary: Protein to search for. Add multiple parameters to search for multiple proteins.
    details: |
      Unipept will return the functional EC-numbers, GO-terms and InterPro entries associated with each of the `input[]` proteins.
      To pass multiple proteins at once, simply add multiple `input[]` parameters (see the *Multiple proteins* example).

      For large inputs, see [Large requests](./index.md#large-requests).
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
    summary: Group the GO-terms by namespace and the InterPro entries by type.
    details: |
      When `true`, the GO-terms are grouped by namespace (cellular component, molecular function, biological process) and the InterPro entries by type.
  - name: names
    type: boolean
    default: false
    summary: Return names of ranks in the lineage if `true`.
    details: |
      When both `names` and `extra` are set to `true`, Unipept will return the names of all ranks in the lineage of the lowest common ancestor.
      Setting only `names` to `true` will not result in additional information fields being returned.
      See the [response](#response) section for an overview of the information fields returned.

      ::: tip Performance penalty
      Setting `extra`, `domains` or `names` to `true` has a performance penalty inferred from additional database queries.
      Do not use these parameters unless the extra information fields are needed.
      :::
response:
  summary: |
    A list of JSON objects is returned. By default, each object contains the following information fields:

    When the `domains` parameter is set to `true`, objects are placed in a group corresponding to their namespace and the objects
    are nested in an additional object. The *With domains* example shows the grouped objects.
  fields:
    - name: protein
      type: string
      summary: The protein that was searched for.
    - name: name
      type: string
      summary: The name of the protein.
    - name: ec
      type: list of objects
      summary: A list of JSON objects that each represent an EC-number associated with the current protein.
      fields:
        - name: ec_number
          type: string
          summary: EC-number associated with the current protein.
        - name: name
          type: string
          when: extra
          summary: Name of the EC-number.
    - name: go
      type: list of objects
      summary: A list of JSON objects that each represent a GO-term associated with the current protein.
      fields:
        - name: go_term
          type: string
          summary: GO-term associated with the current protein.
        - name: name
          type: string
          when: extra
          summary: Name of the GO-term.
    - name: ipr
      type: list of objects
      summary: A list of JSON objects that each represent an InterPro entry associated with the current protein.
      fields:
        - name: code
          type: string
          summary: InterPro entry code associated with the current protein.
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
  - title: One protein
    description: |
      This example retrieves all functional EC-numbers, GO-terms, InterPro entries and the lowest common ancestor associated with the protein *A0JP26*.
    params: { input: [A0JP26] }
  - title: Multiple proteins
    description: |
      This example retrieves all functional EC-numbers, GO-terms, InterPro entries and the lowest common ancestor for both the proteins *A0JP26* and *A0PK11*.
    params: { input: [A0JP26, A0PK11] }
  - title: With extra information
    description: |
      This example retrieves all functional EC-numbers, GO-terms, InterPro entries and the lowest common ancestor associated with the protein *A0JP26* including the name of each EC-number and GO-term, the name and type of each InterPro entry, and the complete lineage.
    params: { input: [A0JP26], extra: true }
  - title: With domains
    description: |
      This example retrieves all functional EC-numbers, GO-terms, InterPro entries and the lowest common ancestor associated with the protein *A0JP26* distributed over the distinct GO-domains and InterPro types.
    params: { input: [A0JP26], domains: true }
  - title: With lineage names
    description: |
      This example retrieves all functional EC-numbers, GO-terms, InterPro entries and the lowest common ancestor associated with the protein *A0JP26* including the names of all ranks in the lineage.
    params: { input: [A0JP26], extra: true, names: true }
---

[Making requests](./index.md#requests) explains how to send a request to this endpoint.

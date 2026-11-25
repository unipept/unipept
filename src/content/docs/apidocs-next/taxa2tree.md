---
title: taxa2tree
subtitle: Returns the taxonomic tree for a given list of taxon identifiers.
layout: api
parameters:
  - name: "input[]"
    type: integer, GET only
    required: true
    summary: List of taxon identifiers to calculate the taxonomic tree for. Add multiple parameters to specify multiple taxon id's.
    details: |
      `input[]` is the required parameter of a GET-request and takes at least one taxon identifier.
      Unipept will compute and return the taxonomic tree for the given taxa.
      To pass multiple taxon identifiers, simply add multiple `input[]` parameters (see the *Multiple taxa* example).
      Each identifier counts once towards the tree; pass `counts` instead if you need to weigh them.
  - name: counts
    type: object, POST only
    required: true
    summary: Taxon identifiers and associated counts to calculate the taxonomic tree for. Should be a JSON-object with taxon id's as keys and counts as values.
    details: |
      `counts` is the required parameter of a POST-request and takes an object with taxon identifiers
      as keys and the number of occurrences of each taxon as values. The counts end up in the `count` and
      `self_count` fields of the resulting tree, which lets you build a tree that is weighted by, for example, the number of
      peptides assigned to each taxon (see the *With counts* example).
      It can be sent either as JSON (with a `Content-Type: application/json` header) or as
      form-encoded `counts[taxon_id]` parameters.

      ::: tip Input size
      Unipept puts no restrictions on the number of taxon identifiers passed to the `input[]` parameter.
      Keep in mind that searching for lots of taxon identifiers at once may cause the request to timeout or, in the case of a GET-request, exceed the maximum URL length.
      When performing bulk searches, we suggest splitting the input set over requests of 100 taxon identifiers each.
      :::
response:
  summary: |
    The taxonomic tree for the given list of taxon identifiers is returned as a JSON object.
    This object is a tree that's represented by a hierarchical construction of nodes.
    By default, the object contains the following information fields extracted from the NCBI taxonomy:
  fields:
    - name: id
      type: integer
      summary: The NCBI taxon id of the node.
    - name: name
      type: string
      summary: The name of the node.
    - name: rank
      type: string
      summary: The taxonomic rank of the node.
    - name: data
      type: object
      summary: Extra information associated with this node.
      fields:
        - name: count
          type: integer
          summary: How many of the given taxa are directly or indirectly associated with this node? (e.g. correspond to the node itself or one of it's children).
        - name: self_count
          type: integer
          summary: How many of the given taxa are directly associated with this node?
    - name: children
      type: list of objects
      summary: A list of nodes that are the children of this node in the NCBI-taxonomy. These have the same structure as the root JSON-object.
examples:
  - title: Multiple taxa
    description: |
      This example calculates and retrieves the taxonomic tree of *Bacteroides fragilis* (taxon id [817](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817)), *Bacteroides intestinalis* (taxon id [329854](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854)) and *Coprobacter fastidiosus* (taxon id [1099853](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853)).
    params: { input: ["817", "329854", "1099853"] }
  - title: With counts
    description: |
      This example calculates and retrieves the taxonomic tree of *Bacteroides fragilis* (taxon id [817](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=817)), *Bacteroides intestinalis* (taxon id [329854](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=329854)) and *Coprobacter fastidiosus* (taxon id [1099853](https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=1099853)), weighted by counts of respectively 3, 5 and 7.
    json: { counts: { "817": 3, "329854": 5, "1099853": 7 } }
---

This method constructs and returns the taxonomic tree for a given list of NCBI taxon identifiers.

Send a POST request (preferred) or a GET request to the URL above.
[Parameters](#parameters) can be included in the request body (POST) or in the query string (GET).

::: tip GET and POST take different parameters
Unlike the other methods, taxa2tree does not accept the same parameters for both request types.
A GET-request takes `input[]`, a plain list of taxon identifiers.
A POST-request takes `counts`, an object that maps taxon identifiers onto the number of
times each of them occurs. Sending `input[]` in a POST-body is silently ignored and returns
an empty tree.
:::

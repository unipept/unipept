---
title: taxa2tree
subtitle: Returns the taxonomic tree for a given list of taxon identifiers.
layout: api
parameters:
  - name: "input[]"
    type: integer
    summary: Taxon identifier to calculate the taxonomic tree for. Required in a GET request. Add multiple parameters to specify multiple taxon id's.
    details: |
      `input[]` is the required parameter of a GET-request and takes at least one taxon identifier.
      Unipept will compute and return the taxonomic tree for the given taxa.
      To pass multiple taxon identifiers, simply add multiple `input[]` parameters (see the *Multiple taxa* example).
      Each identifier counts once towards the tree; pass `counts` instead if you need to weigh them.
  - name: counts
    type: object
    summary: Taxon identifiers with their counts, as an object with taxon ids as keys and counts as values. Required in a POST request.
    details: |
      `counts` is the required parameter of a POST-request and takes an object with taxon identifiers
      as keys and the number of occurrences of each taxon as values. The counts end up in the `count` and
      `self_count` fields of the resulting tree, which lets you build a tree that is weighted by, for example, the number of
      peptides assigned to each taxon (see the *With counts* example).
      It can be sent either as JSON (with a `Content-Type: application/json` header) or as
      form-encoded `counts[taxon_id]` parameters.

      For large inputs, see [Large requests](./index.md#large-requests).
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
          summary: Number of the given taxa at this node or below it.
        - name: self_count
          type: integer
          summary: Number of the given taxa at this node itself.
    - name: children
      type: list of objects
      summary: The child nodes of this node in the NCBI taxonomy, with the same fields as this node.
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

[Making requests](./index.md#requests) explains how to send a request to this endpoint.

::: tip GET and POST take different parameters
Unlike the other methods, taxa2tree does not accept the same parameters for both request types.
A GET-request takes `input[]`, a plain list of taxon identifiers.
A POST-request takes `counts`, an object that maps taxon identifiers onto the number of
times each of them occurs. Sending `input[]` in a POST-body is silently ignored and returns
an empty tree.
:::

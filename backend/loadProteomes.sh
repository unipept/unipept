#!/bin/bash

# precompute some stuff
echo "precomputing the taxa"
rails runner "Proteome.precompute_taxa"

echo "precomputing the assembly caches"
rails runner "Proteome.precompute_proteome_caches"

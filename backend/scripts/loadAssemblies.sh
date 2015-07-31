#!/bin/bash

# precompute some stuff
echo "precomputing the taxa"
rails runner "Assembly.precompute_taxa"

echo "precomputing the assembly caches"
rails runner "Assembly.precompute_assembly_caches"

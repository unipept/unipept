#!/bin/bash

# precompute some stuff
echo "precomputing the taxa"
rails runner -e production "Proteome.json_taxa"

echo "load proteomes"
rails runner -e production "Proteome.json_proteomes"

echo "precomputing the assembly caches"
rails runner -e production "Proteome.precompute_proteome_caches"

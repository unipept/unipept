#!/bin/sh
#PBS -N make-database
#PBS -q long
#PBS -m abe
#PBS -l nodes=1:ppn=8
#PBS -l walltime=72:00:00
#PBS -l vmem=15gb

# Loading the required modules
module load Java
module load Maven

# Check the current directory
pushd "$PBS_O_WORKDIR"

# Inserting our TMPDIR
sed -i "s|MYTMPDIR|$TMPDIR|g" makefile
sed -i "s|MYTMPDIR|$TMPDIR|g" proteomes.sh

# Running the makefile
make --debug=v sequences

# Reset the directory
popd


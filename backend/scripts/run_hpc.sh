#!/bin/bash
#PBS -m abe
#PBS -N UnipeptLoader
#PBS -l vmem=90gb
#PBS -l nodes=1:ppn=all
#PBS -l walltime=70:00:00


echo PROGRESS Building environment
cp -r "$HOME/data/" "./"
cp -r "$HOME/unipept" "./"
mkdir -p "$VSC_SCRATCH_CLUSTER/berkeleydb/"

echo PROGRESS Fetching data
cp "$VSC_DATA_VO/uniprot_sprot.xml.gz"  "$VSC_SCRATCH_CLUSTER"
cp "$VSC_DATA_VO/uniprot_trembl.xml.gz" "$VSC_SCRATCH_CLUSTER"

pushd 'unipept'

echo PROGRESS compiling
module load Java
module load Maven
./backend/scripts/compile.sh

echo PROGRESS loading peptides
module load DB
backend/java/bin/peptide_loader "$VSC_SCRATCH_CLUSTER/uniprot_sprot.xml.gz" "$VSC_SCRATCH_CLUSTER/uniprot_trembl.xml.gz"

echo PROGRESS saving files
cp ec_cross_references.tsv "$VSC_DATA_VO"
cp embl_cross_references.tsv "$VSC_DATA_VO"
cp go_cross_references.tsv "$VSC_DATA_VO"
cp lineages.tsv "$VSC_DATA_VO"
cp peptides.tsv "$VSC_DATA_VO"
cp refseq_cross_references.tsv "$VSC_DATA_VO"
cp uniprotEntries.tsv "$VSC_DATA_VO"

echo PROGRESS done
popd


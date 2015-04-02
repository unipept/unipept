# == Schema Information
#
# Table name: assemblies
#
#  id                         :integer          not null, primary key
#  genbank_assembly_accession :string(16)
#  refseq_assembly_accession  :string(16)
#  taxon_id                   :integer
#  genome_representation      :string(7)        not null
#  assembly_level             :string(20)       not null
#  assembly_name              :string(104)      not null
#  organism_name              :string(86)       not null
#

class Assembly < ActiveRecord::Base
  attr_readonly :id, :genbank_assembly_accession, :refseq_assembly_accession, :genome_representation, :assembly_level, :assembly_name, :organism_name

  belongs_to :lineage, :foreign_key  => "taxon_id", :primary_key  => "taxon_id",  :class_name   => 'Lineage'

  def destroy
    raise ActiveRecord::ReadOnlyRecord
  end

  def delete
    raise ActiveRecord::ReadOnlyRecord
  end

  # TODO
  def self.get_genome_species()
    # order by uses filesort since there's no index on taxon name
    return connection.select_all("SELECT taxons.name, taxons.id, count(*) AS num
     FROM genomes
     INNER JOIN lineages ON (genomes.taxon_id = lineages.taxon_id)
     LEFT JOIN taxons ON (lineages.species = taxons.id)
     WHERE taxons.id IS NOT NULL
     AND status = 'Complete'
     GROUP BY taxons.id
     HAVING num >= 1
     ORDER BY name")
  end

  # TODO
  # returns a set of genome objects for a given species_id
  def self.get_by_species_id(species_id)
    Genome.select("bioproject_id, name").joins(:lineage).where("genomes.status = 'Complete' AND lineages.species = ?", species_id).group("bioproject_id")
  end

  # TODO
  # fills in the taxon_id column
  def self.precompute_taxa
    Genome.all.each do |genome|
      ue = UniprotEntry.find_by_sql("SELECT DISTINCT uniprot_entries.*
            FROM uniprot_entries
            LEFT JOIN embl_cross_references ON uniprot_entry_id = uniprot_entries.id
            WHERE sequence_id = '#{genome.insdc_id}'").first
      unless ue.nil?
        genome.taxon_id = ue.taxon_id
        genome.save
      end
    end
  end

  # TODO
  # fills the genome_cache table
  def self.precompute_genome_caches
    Genome.all.each do |genome|
      GenomeCache.get_by_bioproject_id(genome.bioproject_id)
    end
  end
end

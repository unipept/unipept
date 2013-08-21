# == Schema Information
#
# Table name: genomes
#
#  id            :integer(4)      not null, primary key
#  name          :string(120)     not null
#  bioproject_id :integer(4)      not null
#  insdc_id     :string(15)      not null
#  status        :string(20)      not null
#  species_id    :integer(3)
#  genus_id      :integer(3)
#

class Genome < ActiveRecord::Base
  attr_accessible nil

  belongs_to :lineage, :foreign_key  => "taxon_id", :primary_key  => "taxon_id",  :class_name   => 'Lineage'

  def self.get_genome_species()
    # order by uses filesort since there's no index on taxon name
    return connection.select_all("SELECT taxons.name, taxons.id, count(*) AS num 
     FROM genomes 
     INNER JOIN lineages ON (genomes.taxon_id = lineages.taxon_id)
     LEFT JOIN taxons ON (lineages.species = taxons.id) 
     WHERE taxons.id IS NOT NULL 
     GROUP BY taxons.id 
     HAVING num > 1 
     ORDER BY name")
  end

  # returns a set of genome objects for a given species_id
  def self.get_by_species_id(species_id)
    Genome.select("bioproject_id, name").joins(:lineage).where("lineages.species = ?", species_id).group("bioproject_id")
  end

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

  # fills the genome_cache table
  def self.precompute_genome_caches
    Genome.all.each do |genome|
      GenomeCache.get_by_bioproject_id(genome.bioproject_id)
    end
  end
end

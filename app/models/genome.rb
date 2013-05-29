# == Schema Information
#
# Table name: genomes
#
#  id            :integer(4)      not null, primary key
#  name          :string(120)     not null
#  bioproject_id :integer(4)      not null
#  refseq_id     :string(15)      not null
#  status        :string(45)      not null
#  species_id    :integer(3)
#  genus_id      :integer(3)
#

class Genome < ActiveRecord::Base
  attr_accessible nil
  
  def self.get_genome_species()
    # order by uses filesort since there's no index on taxon name
    return connection.select_all("SELECT taxons.name, taxons.id, count(*) AS num 
    FROM genomes 
    LEFT JOIN taxons ON (genomes.species_id = taxons.id) 
    WHERE taxons.id IS NOT NULL 
    GROUP BY species_id 
    HAVING num > 1 
    ORDER BY name")
  end

  def self.get_by_bioproject_id(bioproject_id)
    Genome.where("bioproject_id = ?", bioproject_id)
  end

  # returns a set of genome objects for a given species_id
  def self.get_by_species_id(species_id)
    Genome.select("bioproject_id, name").where("species_id = ?", species_id).group("bioproject_id")
  end

  # fills in the species_id and genus_id columns
  def self.precompute_species_and_genera
    Genome.all.each do |genome|
      lineage = Lineage.find_by_sql("SELECT DISTINCT lineages.* 
            FROM lineages 
            LEFT JOIN uniprot_entries ON lineages.taxon_id = uniprot_entries.taxon_id 
            LEFT JOIN refseq_cross_references ON uniprot_entry_id = uniprot_entries.id
            WHERE sequence_id = '#{genome.refseq_id}'").first
      unless lineage.nil?
        genome.species_id = lineage.species
        genome.genus_id = lineage.genus
        genome.save
      end
    end
  end
end

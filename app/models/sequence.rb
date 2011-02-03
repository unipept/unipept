# == Schema Information
#
# Table name: sequences
#
#  id       :integer(4)      not null, primary key
#  sequence :string(50)      not null
#

class Sequence < ActiveRecord::Base
  attr_accessible nil
  
  has_many :peptides
  
  validates :sequence,  :presence   => true,
                        :length     => { :within => 5..50 },
                        :format     => { :with => /\A[A-Z]*\z/ },
                        :uniqueness => true
                        
  def occurrences(drafts=true)
    if drafts
      ActiveRecord::Base.connection.execute("SELECT genus.name AS genus, species.name AS species, query.genus_id, query.species_id AS species_id, genomes_with_sequence, number_of_genomes FROM (SELECT sequence_id, species_id, genus_id, COUNT(DISTINCT organism_id) AS genomes_with_sequence FROM unipept.peptides INNER JOIN unipept.organisms ON (organisms.id = peptides.organism_id) WHERE peptides.sequence_id = #{id} GROUP BY sequence_id, species_id) AS query INNER JOIN (SELECT species_id, COUNT(*) AS number_of_genomes FROM unipept.organisms GROUP BY species_id) AS numbers ON (query.species_id = numbers.species_id) INNER JOIN unipept.taxon_names AS species ON (query.species_id = species.tax_id) INNER JOIN unipept.taxon_names AS genus ON (query.genus_id = genus.tax_id)")
    else
      ActiveRecord::Base.connection.execute("SELECT genus.name AS genus, species.name AS species, query.genus_id, query.species_id AS species_id, genomes_with_sequence, number_of_genomes FROM (SELECT sequence_id, species_id, genus_id, COUNT(DISTINCT organism_id) AS genomes_with_sequence FROM unipept.peptides INNER JOIN unipept.organisms ON (organisms.id = peptides.organism_id) WHERE peptides.sequence_id = #{id} AND draft = 0 GROUP BY sequence_id, species_id) AS query INNER JOIN (SELECT species_id, COUNT(*) AS number_of_genomes FROM unipept.organisms GROUP BY species_id) AS numbers ON (query.species_id = numbers.species_id) INNER JOIN unipept.taxon_names AS species ON (query.species_id = species.tax_id) INNER JOIN unipept.taxon_names AS genus ON (query.genus_id = genus.tax_id)")
    end
  end
                        
end

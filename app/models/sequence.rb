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
      ActiveRecord::Base.connection.execute("
      SELECT * FROM
        (SELECT lineages.species, lineages.genus, COUNT(DISTINCT project_id) AS genomes_with_sequence
        FROM unipept.peptides 
        INNER JOIN unipept.genbank_files ON (genbank_files.id = peptides.genbank_file_id) 
        INNER JOIN unipept.lineages ON (genbank_files.taxon_id = lineages.taxon_id)
        WHERE peptides.sequence_id = #{id}
        AND species IS NOT null
        AND genus IS NOT null
        GROUP BY sequence_id, species) AS query
      NATURAL JOIN 
        (SELECT species, COUNT(DISTINCT project_id) AS number_of_genomes
        FROM unipept.genbank_files 
        NATURAL JOIN lineages
        GROUP BY species) AS numbers")
    else
      ActiveRecord::Base.connection.execute("
      SELECT * FROM
        (SELECT lineages.species, lineages.genus, COUNT(DISTINCT project_id) AS genomes_with_sequence
        FROM unipept.peptides 
        INNER JOIN unipept.genbank_files ON (genbank_files.id = peptides.genbank_file_id) 
        INNER JOIN unipept.lineages ON (genbank_files.taxon_id = lineages.taxon_id)
        WHERE peptides.sequence_id = #{id}
        AND draft = 0
        AND species IS NOT null
        AND genus IS NOT null
        GROUP BY sequence_id, species) AS query
      NATURAL JOIN 
        (SELECT species, COUNT(DISTINCT project_id) AS number_of_genomes
        FROM unipept.genbank_files 
        NATURAL JOIN lineages
        WHERE draft = 0
        GROUP BY species) AS numbers")
    end
  end
  
  def lineages
    ActiveRecord::Base.connection.execute("
    SELECT DISTINCT lineages.*
    FROM unipept.peptides 
    INNER JOIN unipept.genbank_files ON (genbank_files.id = peptides.genbank_file_id) 
    INNER JOIN unipept.lineages ON (genbank_files.taxon_id = lineages.taxon_id)
    WHERE peptides.sequence_id = #{id}")
  end
                        
end

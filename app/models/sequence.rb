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
  
  #def lineages(eager_load = false)
  def lineages
    l = Lineage.find_by_sql("
    SELECT DISTINCT lineages.*
    FROM unipept.peptides 
    INNER JOIN unipept.genbank_files ON (genbank_files.id = peptides.genbank_file_id) 
    INNER JOIN unipept.lineages ON (genbank_files.taxon_id = lineages.taxon_id)
    WHERE peptides.sequence_id = #{id}")
    #preload_associations(l, [:superkingdom_t]) if eager_load
    return l
  end
                        
end

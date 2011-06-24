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
    INNER JOIN unipept.uniprot_entries ON (uniprot_entries.id = peptides.uniprot_entry_id) 
    INNER JOIN unipept.lineages ON (uniprot_entries.taxon_id = lineages.taxon_id)
    WHERE peptides.sequence_id = #{id}")
    #preload_associations(l, [:superkingdom_t]) if eager_load
    return l
  end
                        
end

# == Schema Information
#
# Table name: sequences
#
#  id       :integer(4)      not null, primary key
#  sequence :string(50)      not null
#  lca      :integer(3)
#

class Sequence < ActiveRecord::Base
  attr_accessible nil
  
  has_many :peptides
  has_many :original_peptides, :foreign_key  => "original_sequence_id", :primary_key  => "id", :class_name   => 'Peptide'
  
  validates :sequence,  :presence   => true,
                        :length     => { :within => 5..50 },
                        :format     => { :with => /\A[A-Z]*\z/ },
                        :uniqueness => true
  
  def lineages(equate_il = true)
    if equate_il
      l = Lineage.find_by_sql("
      SELECT DISTINCT lineages.*
      FROM unipept.peptides 
      INNER JOIN unipept.uniprot_entries ON (uniprot_entries.id = peptides.uniprot_entry_id) 
      INNER JOIN unipept.lineages ON (uniprot_entries.taxon_id = lineages.taxon_id)
      WHERE peptides.sequence_id = #{id}")
    else
      l = Lineage.find_by_sql("
      SELECT DISTINCT lineages.*
      FROM unipept.peptides 
      INNER JOIN unipept.uniprot_entries ON (uniprot_entries.id = peptides.uniprot_entry_id) 
      INNER JOIN unipept.lineages ON (uniprot_entries.taxon_id = lineages.taxon_id)
      WHERE peptides.original_sequence_id = #{id}")
    end
    return l
  end
                        
end

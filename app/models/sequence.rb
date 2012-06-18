# == Schema Information
#
# Table name: sequences
#
#  id       :integer(4)      not null, primary key
#  sequence :string(50)      not null
#  lca      :integer(3)
#  lca_il   :integer(3)
#

class Sequence < ActiveRecord::Base
  
  has_many :peptides
  has_many :original_peptides, :foreign_key  => "original_sequence_id", :primary_key  => "id", :class_name   => 'Peptide'
  
  # SELECT DISTINCT lineages.* FROM unipept.peptides INNER JOIN unipept.uniprot_entries ON (uniprot_entries.id = peptides.uniprot_entry_id) INNER JOIN unipept.lineages ON (uniprot_entries.taxon_id = lineages.taxon_id) WHERE peptides.sequence_id = #{id}
  def lineages(equate_il = true, eager = false)
    if equate_il  
      if eager
        l = Lineage.select("lineages.*").joins(:uniprot_entries => :peptides).where("peptides.sequence_id = ?", id).uniq.includes(:name,  
                  :superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, 
                  :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, 
                  :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, 
                  :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, 
                  :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, 
                  :varietas_t, :forma_t)
      else
        l = Lineage.select("lineages.*").joins(:uniprot_entries => :peptides).where("peptides.sequence_id = ?", id).uniq
      end
    else
      if eager
        l = Lineage.select("lineages.*").joins(:uniprot_entries => :peptides).where("peptides.original_sequence_id = ?", id).uniq.includes(:name,  
                  :superkingdom_t, :kingdom_t, :subkingdom_t, :superphylum_t, :phylum_t, 
                  :subphylum_t, :superclass_t, :class_t, :subclass_t, :infraclass_t, 
                  :superorder_t, :order_t, :suborder_t, :infraorder_t, :parvorder_t, :superfamily_t, 
                  :family_t, :subfamily_t, :tribe_t, :subtribe_t, :genus_t, :subgenus_t, 
                  :species_group_t, :species_subgroup_t, :species_t, :subspecies_t, 
                  :varietas_t, :forma_t)
      else
        l = Lineage.select("lineages.*").joins(:uniprot_entries => :peptides).where("peptides.original_sequence_id = ?", id).uniq
      end
    end
    return l
  end
  
  def calculate_lca(equate_il = true)
    if equate_il
      if lca_il.nil?
        temp = Lineage.calculate_lca(lineages(true))
        write_attribute(:lca_il, temp) unless temp==-1
        save
      end
      return lca_il
    else
      if lca.nil?
        temp = Lineage.calculate_lca(lineages(false))
        write_attribute(:lca, temp) unless temp==-1
        save
      end
      return lca
    end
  end
                        
end

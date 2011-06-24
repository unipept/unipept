# == Schema Information
#
# Table name: lineages
#
#  taxon_id         :integer(3)      not null
#  superkingdom     :integer(3)
#  kingdom          :integer(3)
#  superphylum      :integer(3)
#  phylum           :integer(3)
#  subphylum        :integer(3)
#  superclass       :integer(3)
#  class            :integer(3)
#  subclass         :integer(3)
#  infraclass       :integer(3)
#  superorder       :integer(3)
#  order            :integer(3)
#  suborder         :integer(3)
#  infraorder       :integer(3)
#  parvorder        :integer(3)
#  superfamily      :integer(3)
#  family           :integer(3)
#  subfamily        :integer(3)
#  tribe            :integer(3)
#  subtribe         :integer(3)
#  genus            :integer(3)
#  subgenus         :integer(3)
#  species_group    :integer(3)
#  species_subgroup :integer(3)
#  species          :integer(3)
#  subspecies       :integer(3)
#  varietas         :integer(3)
#  forma            :integer(3)
#

class Lineage < ActiveRecord::Base
  attr_accessible nil
    
  belongs_to :name,               :foreign_key  => "taxon_id",      :primary_key  => "id",  :class_name   => 'Taxon'

  belongs_to :superkingdom_t,     :foreign_key  => "superkingdom",  :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :kingdom_t,          :foreign_key  => "kingdom",       :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :superphylum_t,      :foreign_key  => "superphylum",   :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :phylum_t,           :foreign_key  => "phylum",        :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :subphylum_t,        :foreign_key  => "subphylum",     :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :superclass_t,       :foreign_key  => "superclass",    :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :class_t,            :foreign_key  => "class",         :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :subclass_t,         :foreign_key  => "subclass",      :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :infraclass_t,       :foreign_key  => "infraclass",    :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :superorder_t,       :foreign_key  => "superorder",    :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :order_t,            :foreign_key  => "order",         :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :infraorder_t,       :foreign_key  => "infraorder",    :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :parvorder_t,        :foreign_key  => "parvorder",     :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :superfamily_t,      :foreign_key  => "superfamily",   :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :family_t,           :foreign_key  => "family",        :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :subfamily_t,        :foreign_key  => "subfamily",     :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :tribe_t,            :foreign_key  => "tribe",         :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :subtribe_t,         :foreign_key  => "subtribe",      :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :genus_t,            :foreign_key  => "genus",         :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :subgenus_t,         :foreign_key  => "subgenus",      :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :species_group_t,    :foreign_key  => "species_group", :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :species_subgroup_t, :foreign_key  => "species_subgroup",:primary_key  => "id",:class_name   => 'Taxon'
  belongs_to :species_t,          :foreign_key  => "species",       :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :subspecies_t,       :foreign_key  => "subspecies",    :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :varietas_t,         :foreign_key  => "varietas",      :primary_key  => "id",  :class_name   => 'Taxon'
  belongs_to :forma_t,            :foreign_key  => "forma",         :primary_key  => "id",  :class_name   => 'Taxon'
                                  
  ORDER = [:superkingdom, :kingdom, :superphylum, :phylum, :subphylum, :superclass, 
            :class_, :subclass, :infraclass, :superorder, :order, :infraorder, 
            :parvorder, :superfamily, :family, :subfamily, :tribe, :subtribe, 
            :genus, :subgenus, :species_group, :species_subgroup, :species, 
            :subspecies, :varietas, :forma]
            
  ORDER_T = [:superkingdom_t, :kingdom_t, :superphylum_t, :phylum_t, :subphylum_t, :superclass_t, 
            :class_t, :subclass_t, :infraclass_t, :superorder_t, :order_t, :infraorder_t, 
            :parvorder_t, :superfamily_t, :family_t, :subfamily_t, :tribe_t, :subtribe_t, 
            :genus_t, :subgenus_t, :species_group_t, :species_subgroup_t, :species_t, 
            :subspecies_t, :varietas_t, :forma_t] 
              
  def set_iterator_position(position)
    @iterator = position
  end
  
  def get_iterator_position
    return @iterator
  end
  
  def has_next?
    @iterator = 0 if @iterator.nil?
    return (ORDER.length > @iterator)
  end
  
  def next
    result = ORDER[@iterator]
    @iterator += 1
    return self[result]
    return read_attribute(result)
  end
  
  def next_t
    result = ORDER_T[@iterator]
    @iterator += 1
    return self.send(result)
  end
  
  #returns the Taxon object of the lowest common ancestor
  def self.calculate_lca_taxon(lineages)
    return Taxon.find_by_id(Lineage.calculate_lca(lineages))
  end
  
  #calculates the lowest common ancestor
  def self.calculate_lca(lineages)
    lca = 1 #default lca
    for rank in ORDER do
      #nils enkel filteren bij species en genus
      if rank == :species || rank == :genus
        current = lineages.map(&rank).uniq.compact
      else
        current = lineages.map(&rank).uniq
      end
      return lca if current.length > 1 #more than one distinct element
      lca = current[0] unless current[0].nil? #save lca if this rank isn't nil
    end
    return lca
  end
  
  # there's a column 'class' in the database which screws
  # up the getters. This method fixes that error.
  def self.instance_method_already_implemented?(method_name)
    return true if method_name == 'class'
    super
  end
  
  def class_
    return read_attribute(:class)
  end
end

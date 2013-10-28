# == Schema Information
#
# Table name: taxons
#
#  id          :integer(3)      not null, primary key
#  name        :string(120)     not null
#  rank        :string(16)
#  parent_id   :integer(3)
#  valid_taxon :boolean(1)      default(TRUE), not null
#

class Taxon < ActiveRecord::Base
  attr_accessible nil
  
  belongs_to :lineage, :foreign_key  => "id", :primary_key  => "taxon_id", :class_name   => 'Lineage'
  
  scope :with_genome, select("DISTINCT taxons.*").joins("RIGHT JOIN uniprot_entries ON taxons.id = uniprot_entries.taxon_id")
  
  #sorting order
  def <=>(o) 
    return -1 if o.nil?
    return self.id <=> o.id
  end
  
end

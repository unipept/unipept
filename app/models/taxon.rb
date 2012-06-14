# == Schema Information
#
# Table name: taxons
#
#  id          :integer(3)      not null, primary key
#  name        :string(256)     not null
#  rank        :string(0)
#  parent_id   :integer(3)
#  valid_taxon :binary(1)       default("b'1'"), not null
#

class Taxon < ActiveRecord::Base
  attr_accessible nil
  
  scope :with_genome, select("DISTINCT taxons.*").joins("RIGHT JOIN uniprot_entries ON taxons.id = uniprot_entries.taxon_id")
  
  #sorting order
  def <=>(o) 
    return -1 if o.nil?
    return self.id <=> o.id
  end
  
end

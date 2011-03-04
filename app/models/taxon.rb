# == Schema Information
#
# Table name: taxons
#
#  id        :integer(4)      not null, primary key
#  name      :string(256)     not null
#  rank      :string(16)
#  parent_id :integer(4)
#

class Taxon < ActiveRecord::Base
  attr_accessible nil
  
  scope :with_genome, select("DISTINCT taxons.*").joins("RIGHT JOIN genbank_files ON taxons.id = genbank_files.taxon_id")
  
end

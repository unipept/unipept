class KeggPathway < ActiveRecord::Base
  has_many :kegg_pathway_mappings
  attr_accessible :long_id, :name

end

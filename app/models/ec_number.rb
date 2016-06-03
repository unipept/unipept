class EcNumber < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :ec_cross_references
  has_many :kegg_pathway_mappings
  has_many :sequences
end

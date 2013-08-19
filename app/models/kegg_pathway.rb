# == Schema Information
#
# Table name: kegg_pathways
#
#  id      :integer          not null, primary key
#  long_id :string(12)       not null
#  name    :string(128)      not null
#

class KeggPathway < ActiveRecord::Base
  has_many :kegg_pathway_mappings

end

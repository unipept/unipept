# == Schema Information
#
# Table name: kegg_pathway_mappings
#
#  id              :integer          not null, primary key
#  ec_number_id    :integer          not null
#  kegg_pathway_id :integer          not null
#

class KeggPathwayMapping < ActiveRecord::Base

  belongs_to :ec_number
  belongs_to :kegg_pathway

  attr_accessible :ec_number_id, :kegg_pathway_id

end

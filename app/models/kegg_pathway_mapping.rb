# == Schema Information
#
# Table name: kegg_pathway_mappings
#
#  id              :integer          not null, primary key
#  ec_number_id    :integer          not null
#  kegg_pathway_id :string(45)       not null
#

class KeggPathwayMapping < ActiveRecord::Base

end

class KeggPathwayMapping < ActiveRecord::Base

  belongs_to :ec_number
  belongs_to :kegg_pathway

  attr_accessible :ec_number_id, :kegg_pathway_id

end

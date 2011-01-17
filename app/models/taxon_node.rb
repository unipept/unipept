# == Schema Information
#
# Table name: taxon_nodes
#
#  id            :integer(4)      not null, primary key
#  tax_id        :integer(4)      not null
#  parentTax_id  :integer(4)
#  rank          :string(45)
#  geneticCode   :integer(4)
#  mitoCode      :integer(4)
#  isTaxonHidden :(1)
#

class TaxonNode < ActiveRecord::Base
end

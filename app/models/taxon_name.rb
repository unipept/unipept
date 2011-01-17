# == Schema Information
#
# Table name: taxon_names
#
#  id        :integer(4)      not null, primary key
#  tax_id    :integer(4)      not null
#  name      :string(256)
#  nameClass :string(64)
#

class TaxonName < ActiveRecord::Base
end

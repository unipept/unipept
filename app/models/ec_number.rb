# == Schema Information
#
# Table name: ec_numbers
#
#  ec_number 		:string(12)       not null, primary key
#  name	            :string(160)      not null
#

class EcNumber < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :ec_cross_references, foreign_key: 'ec_number_id', primary_key: 'id', class_name: 'ec_cross_reference'
  has_many :kegg_pathway_mappings, foreign_key: 'ec_number_id', primary_key: 'id', class_name: 'kegg_pathway_mapping'
end

# == Schema Information
#
# Table name: ec_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  ec_number_code   :string(15)       not null
#

class EcCrossReference < ApplicationRecord
  include ReadOnlyModel
  attr_accessible nil

  belongs_to :uniprot_entry
  belongs_to :ec_number, foreign_key: 'ec_number_code', primary_key: 'code', class_name: 'EcNumber'
end

# == Schema Information
#
# Table name: ec_cross_references
#
#  id               :integer          unsigned, not null, primary key
#  uniprot_entry_id :integer          unsigned, not null
#  ec_number_code   :string(15)       not null
#

class EcCrossReference < ApplicationRecord
  include ReadOnlyModel

  belongs_to :uniprot_entry
  belongs_to :ec_number, foreign_key: 'ec_number_code', primary_key: 'code', class_name: 'EcNumber'
end

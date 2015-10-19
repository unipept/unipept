# == Schema Information
#
# Table name: ec_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  ec_number        :string(12)       not null
#

class EcCrossReference < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  belongs_to :uniprot_entry
  belongs_to :ec_number_info, foreign_key: 'ec_number', primary_key: 'ec_number', class_name: 'ec_number'
end

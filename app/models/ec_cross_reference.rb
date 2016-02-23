# == Schema Information
#
# Table name: ec_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  ec_id            :string(12)       not null
#

class EcCrossReference < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  belongs_to :uniprot_entry
  belongs_to :ec_number
end

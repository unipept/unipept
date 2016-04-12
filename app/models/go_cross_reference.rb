# == Schema Information
#
# Table name: go_cross_references
#
#  id               :integer          not null, primary key
#  uniprot_entry_id :integer          not null
#  go_id            :string(12)       not null
#

class GoCrossReference < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  belongs_to :uniprot_entry
  belongs_to :go_term
end

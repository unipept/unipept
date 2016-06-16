# == Schema Information
#
# Table name: interpro_entries
#
#  id        :integer          not null, primary key
#  parent_id :integer          not null
#  code      :string(15)       not null
#  name      :string(40)       not null
#  type      :string(3)
#

class InterproEntry < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :interpro_cross_references
end

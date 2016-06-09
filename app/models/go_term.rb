# == Schema Information
#
# Table name: go_terms
#
#  id         :integer          not null, primary key
#  go_id      :string(15)       not null
#  name       :string(200)      not null
#  name_space :string(2)        not null
#

class GoTerm < ActiveRecord::Base
  include ReadOnlyModel
  attr_accessible nil

  has_many :go_cross_references
end
